#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy==2.4.6", "opencv-python-headless==4.10.0.84"]
# ///
# Ice Motion Director, 2026-10-29 (0.2.5): written for this repository, not adapted from a source. The frame reading,
# the cut test and the tracked-corner camera fit follow film_gate.py in this folder; the craft plan rule itself lives in
# the ice-direction skill, references/treatment.md section "Craft plan". 2026-10-29 (0.2.5 review): build resets an idle
# run at declared events and at text or card boxes in or out, and takes the idle limit from "idle_max_s", the reference
# or the speaker default, never from the free-text amount; a user frame:flash row lifts only its own windows; plan
# validates the exemption rows. 2026-10-29 (0.2.6, package G2): measure reads depth from pixels (dense optical flow,
# planes, parallax ratio, push-throughs) and writes <video>.depth.json in the depth gate's format, and measures the glow
# radius around light text; build adds finishing per shot against the finish row, the grade per source class, the
# fixed marks and the speaker (recede windows, voice activity from the audio). See NOTICE.md.
"""craft_gate.py: the craft gate. Checks that the craft plan (ice/plan/craft-plan.json) is complete and honest,
measures craft on the pixels of any video, and checks that every planned craft reached the render.

Usage:
  python craft_gate.py plan <project> [--json]
  python craft_gate.py measure <video> --out <json> [--every <s>] [--width <px>] [--depth-out <json>] [--text]
  python craft_gate.py build <project> --render <mp4> [--boxes <json>] [--faces <json>] [--lint <json>] [--edl <json>]
                       [--voice <audio>] [--json]

<project> is the user's project folder, its ice/ folder or any file inside it; ice/ is found by walking up. The rule
(rows, decisions, precedence, exemptions): the ice-direction skill, references/treatment.md section "Craft plan".

plan (standard library only; stages 04, 05 and 06; the edit route at 04 and 06). Reads ice/plan/craft-plan.json and
ice/state.json (route, subtype, current stage). Red when:
  - the file is missing;
  - one of the 18 codes has no row or two rows, or a row names a code outside the list;
  - a decision is not use, not_use or scoped;
  - a use or scoped row has no trigger, reason, source or check;
  - from stage 04 (the later of the plan's "stage" and the state's "current"): a use or scoped row names no "where"
    id, or a where id is not in the stage's plan files: ice/plan/storyboard.md (a row by its number as "3",
    "shot 3", "S3", "beat 3" or "B3", by its id or # cell, or by its Role cell), ice/plan/shots.json (shot ids),
    the edit plan assets/plan.json (scene ids; event ids, or "e00", "e01" and on by position when an event has none),
    ice/plan/cue-sheet.json (event and quiet ids). "film" and a time range "a-b" in seconds are always valid;
  - a not_use row has an empty or banned reason ("not asked", "not requested", "user did not ask", "not in the
    brief", "keep it simple", "to save time", or "not needed" with no source), or no source;
  - a code in style_needs is not_use;
  - a dimension the reference measures (its analysis/depth.json, analysis/events.json or sound_map.json) is not_use
    and the reason does not start with "content conflict:";
  - a content trigger has no answer: a number with a unit, a percent or a money amount in the spoken or shown lines
    of ice/plan/script.md or in the edit transcript (assets/transcript.json) while the data row is not_use with a
    reason that neither starts with "content:" nor names the number; a single speaker take over 8 s in the edit plan
    while the camera row is not_use. A not_use whose source is the user's words, the reference or the style (or a
    style_never entry) outranks a content trigger (precedence levels 2 to 4);
  - the camera row's optional "idle_max_s" is not a positive number;
  - an exemption row is malformed: not an object; no id, or a repeated one; "lifts" not a list of rule ids
    (<gate>:<rule id>, gate lint, story, film, art, look, seam, plan, contract, slop or frame); no element or
    reason; "shots" neither a non-empty list nor "all"; an amount without a measure and a number, or with a negative
    tolerance; a stage other than 04, 05 or 07; or a row the gates would ignore: a lift of a never-lifted class, no
    source (kind user, reference, style or content, and a ref), a content row written at 07, or a source kind its
    rule id does not take (user, reference or style for the richness and coverage floors, the art counts, look G2
    and G3 and every story check; only user for frame:flash).

measure (numpy and opencv): pixel measures of any video, a reference or a render, written as JSON.
  camera   A similarity transform between consecutive samples (every 0.1 s, 320 px wide grey; tracked corners,
           pyramidal optical flow and RANSAC, as film_gate.py): per sample scale, shift (frame widths) and rotation.
           A step counts only when the agreeing points are half the tracked points and span half the frame (a card
           sliding over a still ground is not the camera). Moving: above the per-second thresholds of the ice-remake
           skill, references/measuring.md section 2 (zoom 0.006, pan and tilt 0.008, roll 0.01) after a 3-sample
           median; a move is a run of 0.25 s or more whose total change is visible (1 percent of scale or of the
           frame width, or 0.5 degrees). Shots split at cuts (the luma correlation test of film_gate.py, with 30
           percent of the pixels changed; build adds the cuts the edit plan, its kept ranges and the cue sheet
           declare). Per shot:
           moving share and idle runs. Per move: start, end, kind (named by the camera's direction), scale ratio,
           shift, and progress at 10, 25, 50 and 75 percent of its time (for measured-eases.mjs nearest()). The track
           is chained from step to step, so a long move drifts by a few percent.
  flashes  General flashes in the WCAG 2.3.1 sense, at the video's own frame rate on a 64 px wide copy: a transition
           is a change of relative luminance of at least 0.1 from the last extreme where the darker state is under
           0.8, over at least a quarter of the frame; a flash is a pair of opposing transitions. Max flashes in 1 s.
  finish   Per shot, from samples every 0.4 s at up to 1280 px wide: grain (std of luma minus its Gaussian blur at
           sigma 3, in flat areas), vignette (corner over centre luma, patches a tenth of the shorter side), black
           and white points (luma p1 and p99), Lab mean a* and b*, mean saturation (HSV), edge width in px (about 2
           is sharp at that width; a Gaussian blur of sigma s gives about 2.5 s). Glow: on samples with text boxes
           (--text, or build), the halo radius in px around the brightest light text on a darker ground (ground = the
           box's 20th percentile, core = above ground plus 80 percent of the range, the radius where the mean of each
           one-pixel ring around the core falls to ground plus 10 percent: the ice-remake skill, references/
           measuring.md section 9); boxes that do not hold a row of letters are skipped.
  faces    Haar cascades from cv2.data (frontal, then profile both ways) every 0.2 s on a 640 px copy; boxes in the
           video's pixels. Focus: Laplacian variance in the face box over the background outside the face zone.
  depth    Dense optical flow (Farneback) between samples 0.1 s apart on a 480 px wide grey copy; the camera's
           similarity fitted to the flow of the textured points with RANSAC; each point's rate along that field (1:
           it moves with the dominant plane; 2: twice as fast, nearer; 0.5: farther; under 0.1: the screen layer, a
           caption or a mark that stays put while the picture moves). Rates are clustered per pair in log space: a
           plane holds 5 percent or more of the points and differs from its neighbours by 25 percent or more. A pair
           counts when the field moves at least 0.25 px (a card sliding over a still ground is element motion, not
           depth). Per shot: layers (the most planes that half of its moving pairs show), parallax ratio (fastest
           plane over slowest, median over those pairs), push-throughs (a push in during which the nearest plane,
           at least 1.25 times the slowest, grows by 30 percent or more and crosses the frame edge). The film: most
           layers of any shot, the median parallax ratio, the push-throughs summed, and camera_moving_share from the
           camera track. Written to --depth-out, else <video>.depth.json beside the video, in the depth file format
           of the ice-qa skill, references/motion-density.md section 8 (read by motion_check.py): the measured keys
           camera_moving_share, layers, parallax_ratio and push_through are rewritten from pixels; elements_3d, dof and
           triggers are kept from the file when it exists (written from the plan or by hand), else written empty.

build (numpy and opencv; stages 07 and 09). Runs measure on the render, then red when:
  faces    a text or card box touches the mouth and chin band (the lower 35 percent of the face box) or the eye band
           (20 to 50 percent of its height, plus 20 px above and below) at any sample, or the face zone (the box
           raised by 60 percent of its height, plus 30 px on every side) is less than 30 percent uncovered for 0.3 s
           or more (the ice-type skill, references/caption-placement-safe-zones.md section 4). Faces: detected and
           held through the shot until the next cut, or --faces. Text and card boxes: --boxes (lint.mjs --boxes-out
           writes them for HTML builds), else a text-region detector on the render (morphological gradient, Otsu, a
           horizontal close, components with a text-like shape and stroke density holding 3 or more letters on one
           line, ink and ground at least 90 levels apart, kept when they persist over two samples). Box files: [{"t": s, "boxes": [[x, y, w, h], ...], "width": W, "height": H}, ...], or the
           same list under "samples"; --faces uses "faces" in place of "boxes". The nearest sample applies.
  flashes  more than 3 flashes in any 1 s window (the strobe safe mode: the ice-audio skill,
           references/cue-map-and-beat-sync.md section 6). Only the faithful mode lifts it: an exemption row that
           lifts frame:flash with source kind "user" and the user's quoted words, for the over-limit windows whose
           flashes sit inside its "shots" (time ranges, "all", or plan ids with a known time) and, when it gives an
           amount, at most that many flashes per second x (1 + tolerance); windows outside stay red. Any other row is
           ignored with a warning.
  camera   in a take longer than 8 s, an idle run is longer than the limit. An idle run ends at a camera move, a cut,
           a declared event (the edit plan's "events", the times of ice/plan/cue-sheet.json events, a
           <render>.events.json next to the render; holds do not count) or a text or card box appearing or leaving
           (--boxes, else the text-region detector): a graphic in or out is a visible change. The limit: the camera
           row's "idle_max_s" (a number of seconds), else the reference's measured longest idle in such a take
           (ice/reference/<ref-id>/analysis/craft-measure.json, from craft_gate.py measure) plus 10 percent when the
           row is not not_use, else 5 s for speaker edits (talking-head, podcast, long-form, news, interview) when the
           row is not not_use. The free-text "amount" is never read as the limit.
  evidence every use or scoped row has evidence on the render: camera, moves inside its where ranges; finish, grade
           measures per shot, and grain or vignette above the noise floor when its devices name them; light, the
           focus ratio when its devices name defocus or depth of field; rhythm, the measured shots; transition,
           measured cuts; type, text boxes; any visual code, a craft mark from lint.mjs (--lint, "craft_marks") or a
           "craft" tag on the edit plan's scenes and events or on shots.json shots; a sound code, a cue-sheet entry
           or ice/review/audio-audit.json; depth, two or more planes or a push-through measured inside its where
           ranges. Unmeasured is never n/a: a use row with no evidence is red.
  finishing per measured shot against where its effect is named: the finish row's devices (a device string takes
           the row's "where"; a device object {"device": "<effect>", "where": [...]} its own) and the "finishing"
           list of each shots.json shot. A shot is named when the ranges cover half of it or more. Grain: red when
           named and at or under 1.0, or not named and 2.0 or more. Glow: red when named and under 0.2 percent of the
           frame width (at least 2 px) on a shot with light text, or not named and 0.4 percent or more (at least 3
           px; sharp type reads about 1 px). Vignette (one shot proves
           nothing, measuring.md section 9): red when the named shots' median is 0.92 or more, or when two or more
           shots that do not name it, at least half of them, sit at 0.85 or under.
  grade    per source class: ranges with a "source_class" (edit plan scenes, shots.json shots, else the EDL ranges
           of --edl or an edl.json beside the edit plan, mapped to output time) take the grade of the range, of the
           EDL's "grades" map or of the EDL, and the finish row's devices may name a look on their where ranges. A
           look must measure on its shots against the film's own world (the shots with no look): monochrome
           (outside_mono, "monochrome", "black and white") saturation 0.06 or under; warm duotone or sepia
           (outside_warm_duotone) Lab b* 5 or more above the own world; desaturation (outside_desat_lift,
           "desaturated") saturation at most 0.65 of the own world's; lifted blacks (outside_desat_lift, "lifted
           blacks") a black point 10 levels or more above it; any other grade on an outside class (archive, agency,
           stills, screenshots, portraits) differs on one of them. An own-world shot that measures monochrome, or
           desaturated with lifted blacks, is red (the outside treatment reached the speaker or the film's own world).
  marks    each fixed mark of shots.json "fixed_marks" (else the identity row's "fixed_marks"), same entries: x_pct,
           y_pct, w_pct, optional h_pct, "from" and "to" (seconds or plan ids; the whole film when absent), and
           optional "file" (the mark's image; PNG alpha is the match mask). Template match (normalized correlation,
           scales 0.80 to 1.25) on the 0.2 s samples in its range, inside the slot widened by 6 percent of the frame:
           red when it is missing for 0.4 s or more (score under 0.5), moves by more than 1 percent of the frame
           across the range (it rides the camera or drifts), and, with a file, sits more than 2 percent of the frame
           from its slot or more than 10 percent off its size. Without a file the template is the slot's median over
           the range, so position and size are taken as planned and a flat slot is red.
  speaker  speaker-led videos (a talking-head, podcast, long-form, news, interview, presenter, talk show, lecture,
           course or webinar type, or a cutout row with "recede_windows"): the speaker's face box (the face nearest
           the speaker's median box outside the windows; held through a shot when the cascades lose it) gives the
           mean luma, saturation and Laplacian variance of its inner box every 0.2 s, against the speaker's median
           outside the recede windows. Recede windows: the cutout row's "recede_windows" ([{"start": s, "end": s}],
           'a-b' ranges or plan ids). Voice activity: from the render's audio, or --voice (a voice stem), by energy in
           the speech band and syllable-rate modulation. Red for 0.4 s or more: outside the windows, dimmed over 5
           percent or desaturated over 15 percent; inside a window while the voice is active, dimmed over 5 percent,
           defocused (variance under half the median) or fully grey (saturation under a tenth); inside a window
           while silent, dimmed over 15 percent; a silhouette (luma at most 35 percent of the median) anywhere, except
           the news reel cold open before the first word (the ice-edit skill, references/layers-and-isolation.md
           section 5, the one home of the rule).
  Writes ice/review/craft-gate.json and <render>.depth.json beside the render (the depth section of measure).

Exit codes: 0 pass; 2 red; 1 unreadable input (no project, a bad JSON file, an unreadable video, ffmpeg or a pinned
package missing).

What it cannot catch: whether a device serves the content (the 09 critic reads each use row against the frames);
red flashes (saturated red transitions) and a flash run in the first 3 s (counted, not gated); faces the cascades
miss (small, turned, dark or drawn faces: pass --faces with the matte's box); text the detector misses, or a textured
face it takes for text (pass --boxes for HTML builds); a camera move over a ground with no corners to track; depth
planes on flat untextured grounds (no flow to read), a plane that moves across the camera's direction, 3D element
kinds, depth of field and composite quality (the plan's elements_3d and dof, lint marks and the critic); a vignette on
a single shot; a grade the source footage already had (compare with the source take); a fixed mark on a static
ground when no file is given; music with a strong beat read as voice (the speaker check is then stricter, never
looser: pass --voice with the voice stem); a speaker the cascades never find (pass --faces with the speaker's box).
"""
from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

VERSION = "0.2.9"
LOCAL_CODES = ("camera", "depth", "composite", "light", "finish", "type", "transition", "data", "cutout", "sfx", "music",
               "ambience", "foley", "silence", "voice", "rhythm", "footage", "identity")
try:   # the shared reader (storyboard_lint.py, standard library only); fall back to the internal one when absent
    from storyboard_lint import CRAFT_CODES as SHARED_CODES, load_craft_plan as shared_load_plan
except Exception:   # noqa: BLE001  (missing, or the shared file is mid-edit)
    SHARED_CODES, shared_load_plan = None, None
try:   # the exemption rules of the shared reader: which rows lift what (treatment.md 11.7)
    from storyboard_lint import exemption_for, exemption_issues, exemption_amount, exempt_line
except Exception:   # noqa: BLE001  (without them no exemption applies, and the plan check says so)
    exemption_for = exemption_issues = exemption_amount = exempt_line = None
CRAFT_CODES = tuple(SHARED_CODES) if SHARED_CODES and len(SHARED_CODES) == 18 else LOCAL_CODES
SOUND_CODES = ("sfx", "music", "ambience", "foley", "silence", "voice")
DECISIONS = ("use", "not_use", "scoped")
BANNED_REASONS = ("not asked", "not requested", "user did not ask", "the user did not ask", "not in the brief",
                  "keep it simple", "to save time")

SPEAKER_LAYOUTS = ("face", "split", "broll-split")
SPEAKER_TYPES = re.compile(r"talking|podcast|long[- ]?form|news|interview|speaker|lecture|course|webinar", re.I)
TAKE_MIN_S = 8.0          # a single take longer than this needs a visible change every few seconds
SPEAKER_IDLE_S = 5.0      # default idle limit on such a take for speaker edits
FLASH_LIMIT = 3           # flashes in any 1 s window (WCAG 2.3.1, the strobe safe mode)
COVER_MIN = 0.30          # share of the face zone that stays uncovered
COVER_WINDOW_S = 0.3
GRAIN_FLOOR = 1.0         # high-pass std of studio digital footage sits under this (measuring.md section 9)
VIGNETTE_MAX = 0.92       # corner over centre luma under this is a vignette
FOCUS_MIN = 2.0           # subject sharper than the background by this ratio of Laplacian variance

np = None
cv2 = None


class Unreadable(Exception):
    """An input the gate cannot read: exit 1."""


def load_cv():
    """Import numpy and opencv on the measure and build paths only, with a clear message when they are missing."""
    global np, cv2
    try:
        import numpy
        import cv2 as opencv
    except ImportError as missing:
        sys.exit(f"craft_gate.py measure and build need numpy==2.4.6 and opencv-python-headless==4.10.0.84 (missing: "
                 f"{missing.name}); the plan check needs neither. Install them into a project virtual environment (no "
                 "question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a "
                 "question): python -m pip install -r " + str(HERE / "requirements.txt"))
    np, cv2 = numpy, opencv


# ---------------------------------------------------------------- small helpers
def read_json(path, what):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8-sig"))
    except FileNotFoundError:
        raise Unreadable(f"{what} not found: {path}")
    except (OSError, ValueError) as e:
        raise Unreadable(f"cannot read {what} {path}: {e}")


def read_json_soft(path):
    """A run file read for context: None when it is missing or broken (the plan check reports what it needs)."""
    try:
        return json.loads(Path(path).read_text(encoding="utf-8-sig"))
    except (OSError, ValueError):
        return None


def norm_id(text):
    """An id compared loosely: lower case, no spaces or separators, digits without leading zeros ("Shot 03" = "shot3")."""
    s = re.sub(r"[\s_\-:#.]+", "", str(text).strip().lower())
    return re.sub(r"\d+", lambda m: str(int(m.group())), s)


def where_list(row):
    """A row's "where" as a list of strings (a single string is one id)."""
    w = row.get("where")
    if isinstance(w, list):
        return [str(x) for x in w if str(x).strip()]
    return [str(w)] if w not in (None, "") else []


def stage_number(value):
    m = re.search(r"\d+", str(value or ""))
    return int(m.group()) if m else None


def text_of(value):
    if isinstance(value, list):
        return " ".join(str(v) for v in value)
    return "" if value is None else str(value)


def find_ice(start):
    """The project's ice/ folder, found by walking up from a file or folder, or None."""
    p = Path(start).resolve()
    for d in [p] + list(p.parents):
        if d.name == "ice" and d.is_dir():
            return d
        if (d / "ice").is_dir():
            return d / "ice"
    return None


def load_plan(ice):
    """(plan dict or None, path). Uses the shared reader of storyboard_lint.py when it is there."""
    path = ice / "plan" / "craft-plan.json"
    if not path.is_file():
        return None, path
    plan = None
    if shared_load_plan:
        try:
            plan = shared_load_plan(ice.parent)
        except Exception:   # noqa: BLE001  (the shared reader failed: read the file directly)
            plan = None
    if plan is None:
        plan = read_json(path, "craft plan")
    return plan, path


def parse_span(cell):
    """'0-3', '0:00-0:03', '1.5 - 4 s' -> (start, end) in seconds, or None."""
    nums = re.findall(r"\d+:\d+(?:\.\d+)?|\d+(?:\.\d+)?", str(cell or ""))
    if len(nums) < 2:
        return None
    def sec(tok):
        if ":" in tok:
            m, s = tok.split(":", 1)
            return int(m) * 60 + float(s)
        return float(tok)
    a, b = sec(nums[0]), sec(nums[1])
    return (a, b) if b > a else None


def split_cells(line):
    s = line.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|"):
        s = s[:-1]
    return [c.strip() for c in s.split("|")]


def markdown_tables(text):
    """Every markdown table outside code fences: [(header cells, [row cells])]."""
    tables, lines, fence, i = [], text.splitlines(), False, 0
    while i < len(lines):
        s = lines[i].strip()
        if s.startswith("```"):
            fence = not fence
            i += 1
            continue
        if not fence and s.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|?\s*:?-{2,}", lines[i + 1]):
            head, rows, j = split_cells(lines[i]), [], i + 2
            while j < len(lines) and lines[j].strip().startswith("|"):
                rows.append(split_cells(lines[j]))
                j += 1
            tables.append((head, rows))
            i = j
            continue
        i += 1
    return tables


# ---------------------------------------------------------------- the stage's plan files (where ids and their times)
class PlanFiles:
    """Ids a craft row may name in "where", each with its time range when one is known, plus the run files the
    checks read (edit plan, transcript, cue sheet, shots)."""

    def __init__(self, ice):
        self.ice = ice
        self.ids = {}          # norm id -> {"label", "file", "range"}
        self.files = []
        self.duration = None
        self.edit_plan, self.edit_plan_path = None, None
        self.transcript, self.transcript_path = None, None
        self.cue, self.shots = None, None
        if ice is None:
            return
        self._storyboard(ice / "plan" / "storyboard.md")
        self._shots(ice / "plan" / "shots.json")
        self._edit_plan()
        self._cue_sheet(ice / "plan" / "cue-sheet.json")

    def add(self, key, label, file, rng):
        if key is None or str(key).strip() == "":
            return
        self.ids[norm_id(key)] = {"label": label, "file": file, "range": rng}
        if rng:
            self.duration = max(self.duration or 0.0, rng[1])

    def _storyboard(self, path):
        if not path.is_file():
            return
        tables = markdown_tables(path.read_text(encoding="utf-8", errors="replace"))
        if not tables:
            return
        head, rows = next((t for t in tables if any("time" in h.lower() for h in t[0])), tables[0])
        low = [h.lower().strip() for h in head]
        id_col = next((k for k, h in enumerate(low) if norm_id(h) in ("id", "", "no", "shot", "beat", "shotid", "beatid",
                                                                       "scene", "sceneid")), None)
        role_col = next((k for k, h in enumerate(low) if h == "role"), None)
        time_col = next((k for k, h in enumerate(low) if "time" in h), None)
        rel = str(path)
        self.files.append(rel)
        for n, cells in enumerate(rows, 1):
            cell = lambda k: cells[k] if k is not None and k < len(cells) else ""
            rng = parse_span(cell(time_col))
            label = f"storyboard row {n}"
            for alias in (str(n), f"shot {n}", f"s{n}", f"beat {n}", f"b{n}", f"row {n}"):
                self.add(alias, label, rel, rng)
            if cell(role_col):
                self.add(cell(role_col), label, rel, rng)
            if cell(id_col):
                self.add(cell(id_col), label, rel, rng)

    def _shots(self, path):
        data = read_json_soft(path) if path.is_file() else None
        if not isinstance(data, dict):
            return
        self.shots = data
        self.files.append(str(path))
        for s in data.get("shots") or []:
            if isinstance(s, dict) and s.get("id") is not None:
                a, b = s.get("start_s"), s.get("end_s")
                rng = (float(a), float(b)) if isinstance(a, (int, float)) and isinstance(b, (int, float)) and b > a else None
                self.add(s["id"], f"shots.json {s['id']}", str(path), rng)
        dur = (data.get("format") or {}).get("duration_s") if isinstance(data.get("format"), dict) else None
        if isinstance(dur, (int, float)) and dur > 0:
            self.duration = max(self.duration or 0.0, float(dur))

    def _edit_plan(self):
        """The edit route's plan map (ice-edit references/clock-and-grouping.md section 3, assets/plan.json)."""
        root = self.ice.parent
        candidates = [root / "assets" / "plan.json", self.ice / "plan" / "plan.json", self.ice / "edit" / "assets" / "plan.json",
                      self.ice / "assets" / "plan.json"]
        for depth in ("*/assets/plan.json", "*/*/assets/plan.json"):
            candidates += sorted(p for p in root.glob(depth) if "node_modules" not in p.parts)
        for path in candidates:
            data = read_json_soft(path) if path.is_file() else None
            if isinstance(data, dict) and isinstance(data.get("scenes"), list):
                self.edit_plan, self.edit_plan_path = data, path
                break
        if not self.edit_plan:
            return
        path = self.edit_plan_path
        self.files.append(str(path))
        scenes = {}
        for s in self.edit_plan.get("scenes") or []:
            if not isinstance(s, dict) or s.get("id") is None:
                continue
            a, b = s.get("start"), s.get("end")
            rng = (float(a), float(b)) if isinstance(a, (int, float)) and isinstance(b, (int, float)) and b > a else None
            scenes[str(s["id"])] = rng
            self.add(s["id"], f"edit scene {s['id']}", str(path), rng)
        for k, e in enumerate(self.edit_plan.get("events") or []):
            if not isinstance(e, dict):
                continue
            eid = e.get("id") if e.get("id") is not None else f"e{k:02d}"
            rng = scenes.get(str(e.get("visual")))
            if rng is None and isinstance(e.get("time"), (int, float)):
                rng = (float(e["time"]), float(e["time"]) + 1.0)
            self.add(eid, f"edit event {eid}", str(path), rng)
        dur = self.edit_plan.get("duration")
        if isinstance(dur, (int, float)) and dur > 0:
            self.duration = max(self.duration or 0.0, float(dur))
        for tp in (path.parent / "transcript.json", self.ice / "plan" / "transcript.json"):
            data = read_json_soft(tp) if tp.is_file() else None
            if data is not None:
                self.transcript, self.transcript_path = data, tp
                break

    def _cue_sheet(self, path):
        data = read_json_soft(path) if path.is_file() else None
        if not isinstance(data, dict):
            return
        self.cue = data
        self.files.append(str(path))
        for e in data.get("events") or []:
            if isinstance(e, dict) and e.get("id") is not None and isinstance(e.get("t"), (int, float)):
                self.add(e["id"], f"cue {e['id']}", str(path), (float(e["t"]) - 0.25, float(e["t"]) + 1.0))
        for q in data.get("quiet") or []:
            if isinstance(q, dict) and q.get("id") is not None and isinstance(q.get("start"), (int, float)) \
                    and isinstance(q.get("end"), (int, float)):
                self.add(q["id"], f"quiet {q['id']}", str(path), (float(q["start"]), float(q["end"])))
        dur = data.get("duration")
        if isinstance(dur, (int, float)) and dur > 0:
            self.duration = max(self.duration or 0.0, float(dur))

    def resolve(self, item, duration=None):
        """(found, (start, end) or None, label) for one where item."""
        s = str(item).strip()
        if norm_id(s) == "film":
            return True, (0.0, duration or self.duration or float("inf")), "the whole film"
        m = re.match(r"^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*s?$", s)
        if m and float(m.group(2)) > float(m.group(1)):
            return True, (float(m.group(1)), float(m.group(2))), f"{s} s"
        hit = self.ids.get(norm_id(s))
        if hit:
            return True, hit["range"], hit["label"]
        return False, None, s

    def declared_cuts(self):
        """Cut times the plan files declare: edit scene starts, the edit's kept ranges (edit-decisions.json next to
        the edit plan, jump cuts included) and cue-sheet events of kind cut."""
        cuts = set()
        for s in (self.edit_plan or {}).get("scenes") or []:
            if isinstance(s, dict) and isinstance(s.get("start"), (int, float)) and s["start"] > 0:
                cuts.add(round(float(s["start"]), 3))
        if self.edit_plan_path:
            decisions = read_json_soft(self.edit_plan_path.parent / "edit-decisions.json")
            keeps = decisions.get("keeps") if isinstance(decisions, dict) else None
            for k in keeps or []:
                if isinstance(k, dict) and isinstance(k.get("start"), (int, float)) and k["start"] > 0:
                    cuts.add(round(float(k["start"]), 3))
        for e in (self.cue or {}).get("events") or []:
            if isinstance(e, dict) and isinstance(e.get("t"), (int, float)) \
                    and str(e.get("kind") or e.get("type") or "").lower() == "cut":
                cuts.add(round(float(e["t"]), 3))
        return sorted(cuts)

    def transcript_words(self):
        """[(text, start)] from a word-level transcript (top-level list, .words or .segments[].words)."""
        data = self.transcript
        if isinstance(data, dict):
            words = data.get("words")
            if words is None:
                words = [w for seg in data.get("segments") or [] if isinstance(seg, dict) for w in seg.get("words") or []]
        else:
            words = data
        out = []
        for w in words or []:
            if isinstance(w, dict) and w.get("type") != "spacing":
                txt = w.get("text", w.get("word"))
                if txt:
                    out.append((str(txt), w.get("start") if isinstance(w.get("start"), (int, float)) else None))
        return out


# ---------------------------------------------------------------- content triggers
DIGITS = r"[0-9٠-٩۰-۹]"
NUM = DIGITS + r"(?:[0-9٠-٩۰-۹,.٫٬]*" + DIGITS + r")?"
CURRENCY_SIGN = r"[$€£¥₹₺₽﷼]"
CURRENCY_CODE = r"(?:usd|eur|gbp|egp|sar|aed|kwd|qar|bhd|omr|jod|le)"
UNIT_AFTER = (r"(?:%|٪|percent\b|per\s?cent\b|pct\b"
              r"|(?:k|m|bn|mn|thousand|million|billion|trillion)\b"
              r"|(?:dollars?|euros?|pounds?|riyals?|dirhams?|dinars?|yen|rupees?|lira)\b|" + CURRENCY_CODE + r"\b"
              r"|(?:km|kilomet(?:er|re)s?|miles?|mi|cm|mm|met(?:er|re)s?|kg|kilos?|grams?|g|lbs?|tons?|tonnes?|ml|"
              r"lit(?:er|re)s?|l|gb|mb|tb|kb|mbps|gbps|hz|khz|mhz|ghz|kw|kwh|mw|watts?|w|mph|kph|km/h)\b"
              r"|°[cf]?|degrees?\b"
              r"|(?:seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|yrs?)\b"
              r"|x\b"
              r"|\s?(?:بالمئة|في المئة"
              r"|بالمائة|مليون|مليار"
              r"|ألف|كيلو|كم|متر|دقيقة"
              r"|دقائق|ساعة|ساعات|سنة"
              r"|سنوات|يوم|أيام|جنيه"
              r"|ريال|درهم|دينار|دولار"
              r"|يورو))")
NUMBER_TRIGGER = re.compile(r"(?:" + CURRENCY_SIGN + r"\s?" + NUM + r"|\b" + CURRENCY_CODE + r"\s?" + NUM +
                            r"|(?<![\w.])" + NUM + r"\s?" + UNIT_AFTER + r")", re.I)
SCRIPT_COLUMNS = re.compile(r"\bvo\b|voice|line|on-screen|on screen|text|copy|narration|dialogue|spoken|said", re.I)
SCRIPT_HEADER_LINE = re.compile(r"^\s*(?:mode|language|length|pace|word budget|version)\b", re.I)


def script_copy(text):
    """The spoken and shown lines of ice/plan/script.md: the VO and on-screen text cells of its tables, else every
    line except the header lines; bracketed directions ([pause 1.0s]) removed."""
    cells = []
    for head, rows in markdown_tables(text):
        cols = [k for k, h in enumerate(head) if SCRIPT_COLUMNS.search(h) and "time" not in h.lower()]
        for r in rows:
            cells += [r[k] for k in cols if k < len(r)]
    if not cells:
        cells = [ln for ln in text.splitlines() if not SCRIPT_HEADER_LINE.match(ln) and not ln.strip().startswith("|")]
    return re.sub(r"\[[^\]]*\]", " ", "\n".join(cells))


def number_hits(ice, files):
    """[(number text, where)] for every number with a unit, percent or money amount in the script or transcript."""
    hits = []
    script = ice / "plan" / "script.md"
    if script.is_file():
        for m in NUMBER_TRIGGER.finditer(script_copy(script.read_text(encoding="utf-8", errors="replace"))):
            hits.append((m.group().strip(), "ice/plan/script.md"))
    words = files.transcript_words()
    if words:
        joined, starts = "", []
        for txt, start in words:
            starts.append((len(joined), start))
            joined += txt + " "
        for m in NUMBER_TRIGGER.finditer(joined):
            at = max((s for s in starts if s[0] <= m.start()), default=(0, None))[1]
            where = f"transcript at {at:.2f} s" if isinstance(at, (int, float)) else "transcript"
            hits.append((m.group().strip(), where))
    return hits


def speaker_takes(files):
    """[(scene id, start, end)] of edit plan scenes that show the speaker for longer than TAKE_MIN_S."""
    out = []
    for s in (files.edit_plan or {}).get("scenes") or []:
        if not isinstance(s, dict):
            continue
        a, b = s.get("start"), s.get("end")
        if str(s.get("layout", "")).strip().lower() in SPEAKER_LAYOUTS and isinstance(a, (int, float)) \
                and isinstance(b, (int, float)) and b - a > TAKE_MIN_S:
            out.append((s.get("id"), float(a), float(b)))
    return out


def outranks_content(row, plan):
    """A not_use set by the user's words, the reference or the style beats a content trigger (precedence 2 to 4)."""
    src = text_of(row.get("source")).strip().lower()
    nevers = {str(n.get("dimension")) for n in plan.get("style_never") or [] if isinstance(n, dict)}
    return src.startswith(("user", "reference", "style")) or row.get("dimension") in nevers


def reference_dirs(ice, plan):
    """The reference folders: the plan's "reference" (a folder, or a file's folder) first, then ice/reference/*.
    Empty when the plan names no reference."""
    ref = text_of((plan or {}).get("reference")).strip()
    if ice is None or not ref or ref.lower() == "none":
        return []
    dirs = []
    p = Path(ref) if Path(ref).is_absolute() else ice.parent / ref
    if p.is_dir():
        dirs.append(p)
    elif p.is_file():
        dirs.append(p.parent)
    if (ice / "reference").is_dir():
        dirs += sorted(d for d in (ice / "reference").iterdir() if d.is_dir())
    return list(dict.fromkeys(dirs))


def reference_idle(ice, plan):
    """(seconds, file) of the reference's measured longest idle in a take over 8 s (analysis/craft-measure.json,
    written by craft_gate.py measure at 01), or None."""
    for d in reference_dirs(ice, plan):
        f = d / "analysis" / "craft-measure.json"
        data = read_json_soft(f) if f.is_file() else None
        v = (data.get("summary") or {}).get("longest_idle_in_long_take_s") if isinstance(data, dict) else None
        if isinstance(v, (int, float)) and not isinstance(v, bool) and v > 0:
            return float(v), str(f)
    return None


def reference_measured(ice, plan):
    """{code: why} for the dimensions the reference's own measure files show."""
    found = {}
    for d in reference_dirs(ice, plan):
        depth = read_json_soft(d / "analysis" / "depth.json")
        if isinstance(depth, dict):
            share = depth.get("camera_moving_share")
            if isinstance(share, (int, float)) and share > 0.05:
                found["camera"] = f"camera moving share {share} in {d.name}/analysis/depth.json"
            layers = depth.get("layers")
            if (isinstance(layers, (int, float)) and layers > 1) or depth.get("push_through") or depth.get("elements_3d"):
                found["depth"] = f"depth planes or 3D elements in {d.name}/analysis/depth.json"
            if isinstance(depth.get("dof"), dict) and depth["dof"].get("present"):
                found["light"] = f"depth of field in {d.name}/analysis/depth.json"
        events = read_json_soft(d / "analysis" / "events.json")
        evs = events.get("events") if isinstance(events, dict) else events
        if isinstance(evs, list) and evs:
            found["rhythm"] = f"{len(evs)} pacing events in {d.name}/analysis/events.json"
        sm = read_json_soft(d / "sound_map.json")
        if isinstance(sm, dict):
            if isinstance(sm.get("music"), dict) and sm["music"].get("present"):
                found["music"] = f"music in {d.name}/sound_map.json"
            if sm.get("sfx"):
                found["sfx"] = f"{len(sm['sfx'])} effects in {d.name}/sound_map.json"
            if isinstance(sm.get("voice"), dict) and sm["voice"].get("present"):
                found["voice"] = f"voice in {d.name}/sound_map.json"
    return found


# ---------------------------------------------------------------- plan check
def banned_reason(reason, source):
    """The banned-reason message, or None."""
    r = re.sub(r"\s+", " ", reason.strip().lower()).strip(" .,:;!\"'")
    if not r:
        return "an empty reason"
    for b in BANNED_REASONS:
        if re.match(re.escape(b) + r"\b", r):
            return f"a banned reason (\"{reason.strip()}\")"
    if re.match(r"not needed\b", r) and not source.strip():
        return "\"not needed\" with no source"
    return None


def check_plan(project):
    """The plan check. -> result dict (verdict red or pass)."""
    if not Path(project).exists():
        raise Unreadable(f"project not found: {project}")
    ice = find_ice(project)
    res = {"tool": "craft_gate.py plan", "version": VERSION, "project": str(project), "plan": None, "route": None,
           "subtype": None, "stage": None, "rows": [], "exemptions": [], "reds": [], "notes": [], "verdict": "red"}
    if ice is None:
        res["reds"].append(f"no ice/ folder found from {project}, so no ice/plan/craft-plan.json: write the craft plan "
                           "(the ice-direction skill, references/treatment.md section \"Craft plan\")")
        return res
    plan, path = load_plan(ice)
    res["plan"] = str(path)
    if plan is None:
        res["reds"].append("ice/plan/craft-plan.json is missing: write the craft plan (the ice-direction skill, "
                           "references/treatment.md section \"Craft plan\")")
        return res
    if not isinstance(plan, dict) or not isinstance(plan.get("rows"), list):
        res["reds"].append("ice/plan/craft-plan.json is not a craft plan (an object with a \"rows\" list)")
        return res
    state = read_json_soft(ice / "state.json") or {}
    state = state if isinstance(state, dict) else {}
    res["route"] = state.get("route") or plan.get("route")
    res["subtype"] = state.get("subtype") or plan.get("type")
    stages = [s for s in (stage_number(plan.get("stage")), stage_number(state.get("current"))) if s is not None]
    stage = max(stages) if stages else None
    res["stage"] = stage
    files = PlanFiles(ice)
    reds, notes = res["reds"], res["notes"]

    by_code = {}
    for k, row in enumerate(plan["rows"]):
        if not isinstance(row, dict):
            reds.append(f"row {k + 1} is not an object")
            continue
        code = str(row.get("dimension", "")).strip()
        if code not in CRAFT_CODES:
            reds.append(f"row {k + 1} names \"{code}\", which is not one of the 18 craft codes ({', '.join(CRAFT_CODES)})")
            continue
        by_code.setdefault(code, []).append(row)
    style_needs = [str(c) for c in plan.get("style_needs") or []]
    style_never = {str(n.get("dimension")) for n in plan.get("style_never") or [] if isinstance(n, dict)}
    measured = reference_measured(ice, plan)
    where_needed = stage is not None and stage >= 4

    for code in CRAFT_CODES:
        rows = by_code.get(code, [])
        entry = {"dimension": code, "decision": None, "where": [], "source": "", "problems": []}
        res["rows"].append(entry)
        if not rows:
            entry["problems"].append("no row (every one of the 18 codes needs exactly one row)")
            continue
        if len(rows) > 1:
            entry["problems"].append(f"{len(rows)} rows (exactly one per code)")
        row = rows[0]
        decision = str(row.get("decision", "")).strip()
        entry.update(decision=decision, where=where_list(row), source=text_of(row.get("source")))
        if decision not in DECISIONS:
            entry["problems"].append(f"decision \"{decision}\" is not use, not_use or scoped")
            continue
        reason, source = text_of(row.get("reason")), text_of(row.get("source"))
        if decision in ("use", "scoped"):
            missing = [f for f in ("trigger", "reason", "source", "check") if not text_of(row.get(f)).strip()]
            if missing:
                entry["problems"].append(f"{decision} row has no {', '.join(missing)}")
            if where_needed:
                if not entry["where"]:
                    entry["problems"].append(f"{decision} row names no where id (stage {stage:02d} maps every use to "
                                             "shots, scenes, cues or events)")
                elif not files.files and any(norm_id(w) != "film" and not files.resolve(w)[0] for w in entry["where"]):
                    entry["problems"].append("no storyboard, shots.json, edit plan or cue sheet found to check its where "
                                             "ids against")
                else:
                    unknown = [w for w in entry["where"] if not files.resolve(w)[0]]
                    if unknown:
                        entry["problems"].append(f"where id(s) {', '.join(unknown)} not found in {', '.join(files.files)}")
            if code in style_never:
                notes.append(f"{code}: {decision} although the style's craft profile lists it under never")
        else:
            bad = banned_reason(reason, source)
            if bad:
                entry["problems"].append(f"not_use with {bad}")
            if not source.strip():
                entry["problems"].append("not_use with no source (the type policy, the style profile, a hard rule, "
                                         "the user's words, or what was looked for and where)")
            if code in style_needs:
                entry["problems"].append("not_use although the chosen style needs it (style need in style_needs)")
            if code in measured and not reason.strip().lower().startswith("content conflict:"):
                entry["problems"].append(f"not_use although the reference measures it ({measured[code]}); only a "
                                         "reason starting \"content conflict:\" may set it aside")

    # content triggers
    data_row = (by_code.get("data") or [None])[0]
    if data_row and str(data_row.get("decision", "")).strip() == "not_use" and not outranks_content(data_row, plan):
        reason = text_of(data_row.get("reason")).strip()
        hits = number_hits(ice, files)
        unanswered = [h for h in hits if not reason.lower().startswith("content:") and h[0] not in reason]
        if unanswered:
            shown = "; ".join(f"\"{t}\" ({w})" for t, w in unanswered[:4])
            more = f" and {len(unanswered) - 4} more" if len(unanswered) > 4 else ""
            _row_entry(res, "data")["problems"].append(
                f"not_use, but the content has numbers with units, percents or money amounts: {shown}{more}; use a "
                "counter, chart or proportion device, or give a reason starting \"content:\" that names them")
    cam_row = (by_code.get("camera") or [None])[0]
    if cam_row and str(cam_row.get("decision", "")).strip() == "not_use" and not outranks_content(cam_row, plan):
        takes = speaker_takes(files)
        if takes:
            shown = ", ".join(f"{sid} ({a:g}-{b:g} s)" for sid, a, b in takes[:4])
            _row_entry(res, "camera")["problems"].append(
                f"not_use, but the edit plan has single speaker takes over {TAKE_MIN_S:g} s: {shown}; a long take needs "
                "a visible change every 3 to 5 s")
    if cam_row and "idle_max_s" in cam_row:
        v = cam_row.get("idle_max_s")
        if not isinstance(v, (int, float)) or isinstance(v, bool) or not v > 0:
            _row_entry(res, "camera")["problems"].append(
                f"idle_max_s is {json.dumps(v)}: write the longest idle run allowed in a take as a positive number of "
                "seconds, or leave the key out")
    for entry in res["rows"]:
        reds += [f"{entry['dimension']}: {p}" for p in entry["problems"]]
    res["exemptions"] = check_exemptions(plan)
    for x in res["exemptions"]:
        reds += [f"{x['label']}: {p}" for p in x["problems"]]
    res["verdict"] = "red" if reds else "pass"
    return res


RULE_GATES = ("lint", "story", "film", "art", "look", "seam", "plan", "contract", "slop", "frame")
RULE_ID = re.compile(r"^(?:" + "|".join(RULE_GATES) + r"):[A-Za-z0-9_.-]+$", re.I)


def check_exemptions(plan):
    """[{"label", "id", "problems"}] for the plan's exemption rows: the schema of treatment.md 11.2 and the rows the
    gates would ignore (storyboard_lint.exemption_issues: never-lifted lifts, no source, a content row written at 07,
    a source kind its rule id does not take). A row with problems is red."""
    rows = plan.get("exemptions")
    if rows is None:
        return []
    if not isinstance(rows, list):
        return [{"label": "exemptions", "id": None, "problems": ["\"exemptions\" is not a list of rows"]}]
    out, seen = [], {}
    for k, row in enumerate(rows, 1):
        entry = {"label": f"exemption {k}", "id": None, "problems": []}
        out.append(entry)
        bad = entry["problems"].append
        if not isinstance(row, dict):
            bad("is not an object")
            continue
        rid = row.get("id")
        if isinstance(rid, str) and rid.strip():
            entry.update(label=f"exemption {rid.strip()}", id=rid.strip())
            if rid.strip() in seen:
                bad(f"repeats the id of row {seen[rid.strip()]}")
            seen.setdefault(rid.strip(), k)
        else:
            bad("has no id (X-01 onward)")
        lifts = row.get("lifts")
        if not isinstance(lifts, list) or not lifts or not all(isinstance(x, str) and x.strip() for x in lifts):
            bad("\"lifts\" is not a non-empty list of rule ids")
        else:
            unknown = [x for x in lifts if not RULE_ID.match(x.strip())]
            if unknown:
                bad(f"lifts {', '.join(unknown)}: not a rule id (<gate>:<rule id>, gate {', '.join(RULE_GATES)})")
        for key in ("element", "reason"):
            if not text_of(row.get(key)).strip():
                bad(f"has no {key}")
        shots = row.get("shots")
        if isinstance(shots, str):
            if shots.strip().lower() != "all":
                bad(f"\"shots\" is the string {json.dumps(shots)}: write a list of shot ids or 'a-b' time ranges, or \"all\"")
        elif not isinstance(shots, list) or not shots or not all(
                (isinstance(s, str) and s.strip()) or (isinstance(s, (int, float)) and not isinstance(s, bool)) for s in shots):
            bad("\"shots\" is not a non-empty list of shot ids or 'a-b' time ranges, nor \"all\"")
        if row.get("amount") is not None:
            am = row["amount"]
            if not isinstance(am, dict) or not text_of(am.get("measure")).strip() or \
                    (exemption_amount is not None and exemption_amount(row) is None):
                bad("\"amount\" needs a measure and a value with a number")
            elif am.get("tolerance") is not None and (not isinstance(am["tolerance"], (int, float))
                                                      or isinstance(am["tolerance"], bool) or am["tolerance"] < 0):
                bad("\"amount.tolerance\" is not a number of 0 or more")
        if stage_number(row.get("stage")) not in (4, 5, 7):
            bad(f"stage {json.dumps(row.get('stage'))} is not 04, 05 or 07")
        if exemption_issues is None:
            bad("cannot be checked against the source rules: storyboard_lint.py next to this script cannot be imported")
            continue
        whole, per = exemption_issues(row)
        if whole:
            bad(f"{whole}; the gates ignore it")
        for lift, why in per.items():
            bad(f"{lift}: {why}; the gates ignore it for that rule")
    return out


def _row_entry(res, code):
    return next(e for e in res["rows"] if e["dimension"] == code)


def plan_report(res):
    L = [f"craft_gate.py plan: {res['plan'] or 'no craft plan'}",
         f"route {res['route'] or 'unknown'}, type {res['subtype'] or 'unknown'}, stage "
         + (f"{res['stage']:02d}" if res["stage"] is not None else "unknown")]
    if res["rows"]:
        L.append(f"  {'code':<11} {'decision':<9} {'where':<26} result")
        for e in res["rows"]:
            where = ", ".join(e["where"])[:26]
            L.append(f"  {e['dimension']:<11} {str(e['decision'] or '-'):<9} {where:<26} "
                     + ("RED" if e["problems"] else "ok"))
    if res.get("exemptions"):
        L.append("  exemption rows: " + ", ".join(f"{x['id'] or x['label']} {'RED' if x['problems'] else 'ok'}"
                                                  for x in res["exemptions"]))
    if res["reds"]:
        L.append("Reds:")
        L += [f"  - {r}" for r in res["reds"]]
    if res["notes"]:
        L.append("Notes:")
        L += [f"  - {n}" for n in res["notes"]]
    L.append("Verdict: RED. Fix the plan rows above and run this command again." if res["verdict"] == "red"
             else "Verdict: PASS. Every code has an honest row.")
    return L


# ---------------------------------------------------------------- video reading
def probe(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height,avg_frame_rate,r_frame_rate:format=duration", "-of", "json", str(path)])
    j = json.loads(out)
    if not j.get("streams"):
        raise RuntimeError("no video stream")
    s = j["streams"][0]
    def rate(v):
        try:
            a, b = str(v).split("/")
            return float(a) / float(b) if float(b) else 0.0
        except ValueError:
            return 0.0
    fps = rate(s.get("avg_frame_rate")) or rate(s.get("r_frame_rate")) or 25.0
    return int(s["width"]), int(s["height"]), float((j.get("format") or {}).get("duration") or 0), fps


def even(v):
    return max(2, int(round(v / 2)) * 2)


def stream_frames(path, fps, width, height):
    """Yield RGB frames decoded by ffmpeg at fps, scaled to width x height, one at a time."""
    size = width * height * 3
    cmd = ["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"fps={fps:.6g},scale={width}:{height}:flags=area",
           "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    count = 0
    try:
        while True:
            buf = proc.stdout.read(size)
            if len(buf) < size:
                break
            count += 1
            yield np.frombuffer(buf, np.uint8).reshape(height, width, 3)
    finally:
        proc.stdout.close()
        err = proc.stderr.read().decode("utf-8", "replace")
        proc.stderr.close()
        proc.wait()
    if count == 0:
        raise RuntimeError(f"ffmpeg decoded no frame: {err.strip()[:300]}")


# ---------------------------------------------------------------- camera track
ZOOM_T, PAN_T, ROLL_T = 0.006, 0.008, 0.01      # per second (measuring.md section 2)
MOVE_MIN_S = 0.25
VISIBLE_SCALE, VISIBLE_SHIFT, VISIBLE_ROLL = 0.01, 0.01, math.radians(0.5)


def similarity(a, b):
    """Similarity transform a->b from tracked corners (as film_gate.pair_transform). -> (M, inliers, ratio, span) or None.
    ratio: inliers over tracked points; span: the larger side of the inliers' box over the frame side."""
    pts = cv2.goodFeaturesToTrack(a, maxCorners=300, qualityLevel=0.01, minDistance=6, blockSize=5)
    if pts is None or len(pts) < 15:
        return None
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(a, b, pts, None, winSize=(21, 21), maxLevel=3)
    ok = st.ravel() == 1
    if ok.sum() < 12:
        return None
    p0, p1 = pts[ok].reshape(-1, 2), nxt[ok].reshape(-1, 2)
    M, inl = cv2.estimateAffinePartial2D(p0, p1, method=cv2.RANSAC, ransacReprojThreshold=1.0)
    if M is None:
        return None
    inl = inl.ravel().astype(bool)
    q = p0[inl]
    h, w = a.shape
    span = max(float(np.ptp(q[:, 0])) / w, float(np.ptp(q[:, 1])) / h) if len(q) else 0.0
    return M, int(inl.sum()), float(inl.sum()) / len(p0), span


def camera_step(a, b):
    """One sample pair: frame difference, luma correlation, residual after compensation, and the camera's step."""
    a16, b16 = a.astype(np.int16), b.astype(np.int16)
    diff = np.abs(b16 - a16)
    d = float(diff.mean())
    step = {"d": d, "changed": float((diff > 16).mean()), "corr": 1.0, "loc": d, "valid": False, "zoom": 0.0, "dx": 0.0,
            "dy": 0.0, "rot": 0.0}
    if d < 0.05:                       # identical samples: the camera is still
        step["valid"] = True
        return step
    fa, fb = a.astype(np.float32), b.astype(np.float32)
    fa -= fa.mean()
    fb -= fb.mean()
    step["corr"] = float((fa * fb).sum() / (math.sqrt(float((fa * fa).sum()) * float((fb * fb).sum())) + 1e-6))
    fit = similarity(a, b)
    if fit is None:
        return step
    M, n_in, ratio, span = fit
    if n_in < 20 or ratio < 0.5 or span < 0.5:
        return step                   # no single motion field over the picture: element motion, not the camera
    h, w = a.shape
    cx, cy = w / 2, h / 2
    qx = M[0, 0] * cx + M[0, 1] * cy + M[0, 2]
    qy = M[1, 0] * cx + M[1, 1] * cy + M[1, 2]
    step.update(valid=True, zoom=math.log(max(1e-6, math.hypot(M[0, 0], M[1, 0]))), dx=(qx - cx) / w, dy=(qy - cy) / w,
                rot=math.atan2(M[1, 0], M[0, 0]))
    warped = cv2.warpAffine(a, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    step["loc"] = float(np.abs(b16 - warped.astype(np.int16)).mean())
    return step


def detect_cuts(steps, every, declared=()):
    """Cut-like pairs and the first pair of each cut. Detected: film_gate.py's test (a whole-frame jump the camera does
    not explain, with the luma correlation under 0.7) and at least 30 percent of the pixels changed, so a caption
    popping on a flat ground is not a cut. Declared cut times (the edit plan, the cue sheet) are added."""
    d = np.array([s["d"] for s in steps])
    n = len(d)
    cut_like = np.zeros(n, bool)
    for i in range(n):
        nb = np.concatenate([d[max(0, i - 6):i], d[i + 1:min(n, i + 7)]])
        med = float(np.median(nb)) if len(nb) else 0.0
        s = steps[i]
        cut_like[i] = (s["d"] >= max(8.0, 3 * med + 2) and s["loc"] >= 0.6 * s["d"] and s["corr"] < 0.7
                       and s["changed"] >= 0.3)
    first = cut_like & ~np.concatenate([[False], cut_like[:-1]])
    for t in declared:
        k = int(round(t / every)) - 1
        if 0 <= k < n:
            first[k] = cut_like[k] = True
    return cut_like, first


def median3(x):
    p = np.pad(x, 1, mode="edge")
    return np.median(np.stack([p[:-2], p[1:-1], p[2:]]), axis=0)


def moving_steps(steps, cut_like, every):
    """Per pair: moving after a 3-sample median of the per-second rates."""
    def rate(key):
        v = np.array([abs(s[key]) if s["valid"] else 0.0 for s in steps]) / every
        v[cut_like] = 0.0
        return median3(v)
    return (rate("zoom") > ZOOM_T) | (rate("dx") > PAN_T) | (rate("dy") > PAN_T) | (rate("rot") > ROLL_T)


def move_kind(zoom, dx, dy, rot):
    """The dominant part of a move, named by the camera's direction (the picture slides the other way)."""
    parts = {"zoom": abs(zoom) / ZOOM_T, "pan": abs(dx) / PAN_T, "tilt": abs(dy) / PAN_T, "roll": abs(rot) / ROLL_T}
    top = max(parts, key=parts.get)
    if top == "zoom":
        return "push_in" if zoom > 0 else "pull_out"
    if top == "pan":
        return "move_right" if dx < 0 else "move_left"
    if top == "tilt":
        return "move_down" if dy < 0 else "move_up"
    return "roll"


def move_progress(steps, i, j, key):
    """Share of the move's total change reached at 10, 25, 50 and 75 percent of its time."""
    vals = np.array([steps[k][key] if steps[k]["valid"] else 0.0 for k in range(i, j + 1)])
    total = vals.sum()
    if abs(total) < 1e-9:
        return None
    cum = np.concatenate([[0.0], np.cumsum(vals)]) / total
    x = np.linspace(0, 1, len(cum))
    return [round(float(np.interp(f, x, cum)), 3) for f in (0.10, 0.25, 0.50, 0.75)]


def find_moves(steps, moving, cut_like, every):
    """Runs of moving pairs (one-pair gaps bridged, cuts end a run) that last MOVE_MIN_S and change visibly."""
    moves, covered, n, i = [], np.zeros(len(steps), bool), len(steps), 0
    while i < n:
        if not moving[i] or cut_like[i]:
            i += 1
            continue
        j = i
        while j + 1 < n and not cut_like[j + 1] and (moving[j + 1] or (j + 2 < n and moving[j + 2] and not cut_like[j + 2])):
            j += 1
        while not moving[j]:
            j -= 1
        if (j - i + 1) * every >= MOVE_MIN_S - 1e-9:
            tot = {k: sum(steps[p][k] for p in range(i, j + 1) if steps[p]["valid"]) for k in ("zoom", "dx", "dy", "rot")}
            if abs(tot["zoom"]) >= VISIBLE_SCALE or max(abs(tot["dx"]), abs(tot["dy"])) >= VISIBLE_SHIFT \
                    or abs(tot["rot"]) >= VISIBLE_ROLL:
                kind = move_kind(tot["zoom"], tot["dx"], tot["dy"], tot["rot"])
                key = {"push_in": "zoom", "pull_out": "zoom", "move_left": "dx", "move_right": "dx", "move_up": "dy",
                       "move_down": "dy", "roll": "rot"}[kind]
                moves.append({"start": round(i * every, 3), "end": round((j + 1) * every, 3), "kind": kind,
                              "scale_ratio": round(math.exp(tot["zoom"]), 4), "shift_x": round(tot["dx"], 4),
                              "shift_y": round(tot["dy"], 4), "rotation_deg": round(math.degrees(tot["rot"]), 2),
                              "progress_10_25_50_75": move_progress(steps, i, j, key)})
                covered[i:j + 1] = True
        i = j + 1
    return moves, covered


def shot_spans(first_cut, n_frames):
    """[(first frame, end frame)] split at cuts; shots under 3 samples join the one before."""
    bounds = sorted(set([0] + [int(k) + 1 for k in np.where(first_cut)[0]] + [n_frames]))
    shots = []
    for s, e in zip(bounds[:-1], bounds[1:]):
        if e - s >= 3 or not shots:
            shots.append((s, e))
        else:
            shots[-1] = (shots[-1][0], e)
    return shots


def idle_runs(covered, cut_like, s, e, every):
    """Runs (start, end) in seconds inside frames s..e-1 where no camera move is under way. A run of idle pairs
    a..b-1 holds frames a..b still, so it lasts until frame b+1 shows the change (or the shot ends)."""
    runs, start = [], None
    for p in range(s, e - 1):
        idle = not covered[p] and not cut_like[p]
        if idle and start is None:
            start = p
        elif not idle and start is not None:
            runs.append((round(start * every, 3), round((p + 1) * every, 3)))
            start = None
    if start is not None:
        runs.append((round(start * every, 3), round(e * every, 3)))
    return [r for r in runs if r[1] > r[0]]


# ---------------------------------------------------------------- flashes
def srgb_lut():
    c = np.arange(256, dtype=np.float32) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4).astype(np.float32)


def measure_flashes(path, fps, W, H):
    """General flashes at the video's own frame rate (64 px wide). -> dict."""
    rate = fps if 0 < fps <= 60 else 30.0
    fw = 64
    fh = even(H * fw / W)
    lut = srgb_lut()
    weights = np.array([0.2126, 0.7152, 0.0722], np.float32)
    ext = trend = None
    ups, downs = [], []
    for rgb in stream_frames(path, rate, fw, fh):
        L = lut[rgb] @ weights
        if ext is None:
            ext, trend = L.copy(), np.zeros(L.shape, np.int8)
            ups.append(0.0)
            downs.append(0.0)
            continue
        grow, shrink = (trend == 1) & (L > ext), (trend == -1) & (L < ext)
        ext[grow], ext[shrink] = L[grow], L[shrink]
        darker = np.minimum(ext, L)
        rise = (trend <= 0) & (L - ext >= 0.1) & (darker < 0.8)
        fall = (trend >= 0) & (ext - L >= 0.1) & (darker < 0.8)
        trend[rise], trend[fall] = 1, -1
        changed = rise | fall
        ext[changed] = L[changed]
        ups.append(float(rise.mean()))
        downs.append(float(fall.mean()))
    times = []
    for shares in (ups, downs):
        prev_counted = False
        for k, v in enumerate(shares):
            joined = v + (shares[k - 1] if k and not prev_counted else 0.0)
            counted = v >= 0.25 or (joined >= 0.25 and v > 0)
            if counted:
                times.append(k / rate)
            prev_counted = counted
    times.sort()
    best, over = 0, []
    for a, t0 in enumerate(times):
        count = sum(1 for t in times[a:] if t < t0 + 1.0)
        flashes = count // 2
        best = max(best, flashes)
        if flashes > FLASH_LIMIT:
            if over and t0 <= over[-1][1]:
                over[-1] = [over[-1][0], round(t0 + 1.0, 2), max(over[-1][2], flashes)]
            else:
                over.append([round(t0, 2), round(t0 + 1.0, 2), flashes])
    first3 = sum(1 for t in times if t < 3.0) // 2
    return {"fps": round(rate, 3), "transitions": len(times), "transition_times_s": [round(t, 3) for t in times[:400]],
            "max_per_s": best, "over_limit": over, "first_3s_flashes": first3}


# ---------------------------------------------------------------- faces, focus, text, finishing
FACE_DETECT_EVERY = 0.2
FINISH_EVERY = 0.4
DETAIL_WIDTH, FACE_WIDTH = 1280, 640


def load_cascades():
    root = Path(cv2.data.haarcascades)
    frontal = cv2.CascadeClassifier(str(root / "haarcascade_frontalface_default.xml"))
    profile = cv2.CascadeClassifier(str(root / "haarcascade_profileface.xml"))
    if frontal.empty() or profile.empty():
        raise RuntimeError(f"the Haar cascades are missing from {root}")
    return frontal, profile


def iou(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    ix = max(0, min(ax + aw, bx + bw) - max(ax, bx))
    iy = max(0, min(ay + ah, by + bh) - max(ay, by))
    inter = ix * iy
    union = aw * ah + bw * bh - inter
    return inter / union if union > 0 else 0.0


def merge_boxes(boxes, limit=0.3):
    kept = []
    for b in sorted(boxes, key=lambda x: -x[2] * x[3]):
        if all(iou(b, k) <= limit for k in kept):
            kept.append(b)
    return kept


def detect_faces(grey, cascades):
    """Face boxes on one small grey frame: frontal first, then profile facing either way."""
    frontal, profile = cascades
    eq = cv2.equalizeHist(grey)
    h, w = eq.shape
    side = max(24, int(min(w, h) * 0.06))
    found = [tuple(int(v) for v in b) for b in frontal.detectMultiScale(eq, scaleFactor=1.1, minNeighbors=6,
                                                                        minSize=(side, side))]
    if not found:
        found += [tuple(int(v) for v in b) for b in profile.detectMultiScale(eq, scaleFactor=1.1, minNeighbors=6,
                                                                             minSize=(side, side))]
        for x, y, fw, fh in profile.detectMultiScale(cv2.flip(eq, 1), scaleFactor=1.1, minNeighbors=6, minSize=(side, side)):
            found.append((int(w - x - fw), int(y), int(fw), int(fh)))
    return merge_boxes(found)


def face_zone(face, W, H):
    """The face safe zone: the box raised by 60 percent of its height, plus 30 px on every side, inside the frame."""
    x, y, w, h = face
    x0, y0 = max(0.0, x - 30), max(0.0, y - 0.6 * h - 30)
    x1, y1 = min(float(W), x + w + 30), min(float(H), y + h + 30)
    return (x0, y0, max(0.0, x1 - x0), max(0.0, y1 - y0))


def mouth_band(face):
    x, y, w, h = face
    return (x, y + 0.65 * h, w, 0.35 * h)


def eye_band(face):
    x, y, w, h = face
    return (x, y + 0.2 * h - 20, w, 0.3 * h + 40)


def overlaps(a, b):
    return min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0]) > 0 and min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1]) > 0


def covered_share(zone, boxes, grid=100):
    """Share of the zone under the union of the boxes (rasterized on a grid x grid mask)."""
    zx, zy, zw, zh = zone
    if zw <= 0 or zh <= 0:
        return 0.0
    mask = np.zeros((grid, grid), bool)
    for x, y, w, h in boxes:
        x0, x1 = int(math.floor((x - zx) / zw * grid)), int(math.ceil((x + w - zx) / zw * grid))
        y0, y1 = int(math.floor((y - zy) / zh * grid)), int(math.ceil((y + h - zy) / zh * grid))
        x0, x1, y0, y1 = max(0, x0), min(grid, x1), max(0, y0), min(grid, y1)
        if x1 > x0 and y1 > y0:
            mask[y0:y1, x0:x1] = True
    return float(mask.mean())


def focus_ratio(grey, faces, sx, sy):
    """Laplacian variance in the largest face box over the background outside every face zone (grey pixels)."""
    lap = cv2.Laplacian(grey, cv2.CV_32F)
    h, w = grey.shape
    background = np.ones((h, w), bool)
    best = None
    for f in faces:
        x, y, fw, fh = f[0] / sx, f[1] / sy, f[2] / sx, f[3] / sy
        zx, zy, zw, zh = face_zone((x, y, fw, fh), w, h)
        background[int(zy):int(zy + zh), int(zx):int(zx + zw)] = False
        box = lap[max(0, int(y)):int(y + fh), max(0, int(x)):int(x + fw)]
        if box.size and (best is None or box.size > best.size):
            best = box
    if best is None or background.sum() < 0.05 * background.size:
        return None
    return round(min(999.0, float(best.var()) / max(float(lap[background].var()), 1e-6)), 2)


def letters_row(crop):
    """True when a crop holds a row of letters: Otsu ink at least 90 levels from its ground, and 3 or more letter
    blobs of similar height whose centres sit on one line (soft texture and single blobs fail)."""
    level, ink = cv2.threshold(crop, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    lo, hi = crop[crop <= level], crop[crop > level]
    if not lo.size or not hi.size or float(hi.mean()) - float(lo.mean()) < 90:
        return False
    if ink.mean() > 127:                       # the ink is the smaller class
        ink = 255 - ink
    n, _, st, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    h = crop.shape[0]
    tall = [st[c] for c in range(1, n) if st[c][3] >= 0.3 * h and st[c][2] <= 1.5 * h]
    if len(tall) < 3:
        return False
    heights = np.array([s[3] for s in tall], float)
    centres = np.array([s[1] + s[3] / 2 for s in tall], float)
    return heights.std() / heights.mean() < 0.5 and centres.std() < 0.2 * h


def detect_text(grey):
    """Text boxes (a word or a line) on one small grey frame: morphological gradient, Otsu, a horizontal close, then
    components shaped like type (wider than tall, a solid closed bar, a stroke density of type) holding a row of
    letters (letters_row)."""
    h, w = grey.shape
    grad = cv2.morphologyEx(grey, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    level, bw = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    if level < 40:
        _, bw = cv2.threshold(grad, 40, 255, cv2.THRESH_BINARY)
    closed = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (max(9, w // 60), 1)))
    n, _, stats, _ = cv2.connectedComponentsWithStats(closed, connectivity=8)
    boxes = []
    for c in range(1, n):
        x, y, bw_, bh, area = (int(v) for v in stats[c])
        if bh < 0.015 * h or bh > 0.2 * h or bw_ < 0.04 * w or bw_ < 1.5 * bh:
            continue
        if area / float(bw_ * bh) < 0.45:
            continue
        if not 0.15 <= bw[y:y + bh, x:x + bw_].mean() / 255.0 <= 0.85:
            continue
        if not letters_row(grey[y:y + bh, x:x + bw_]):
            continue
        boxes.append((x, y, bw_, bh))
    return boxes


def screen_and_fringe(rgb, g, flat):
    """Halftone or scanline FFT ratio and chromatic aberration offset of one frame (ice-remake measuring.md section 9).
    FFT: the high-passed flattest box under a Hann window, DC zeroed; the strongest peak over the spectrum median, with
    its period in px and angle. Fringe: phase correlation of the R and B Sobel edges against the G edges, in px. Both
    are in px of the analysis width (reported as finish_width)."""
    h, w = g.shape
    s = max(32, min(h, w) // 3)
    best = (-1.0, 0, 0)
    for y in sorted({0, (h - s) // 2, h - s}):
        for x in sorted({0, (w - s) // 2, w - s}):
            share = float(flat[y:y + s, x:x + s].mean())
            if share > best[0]:
                best = (share, y, x)
    _, y, x = best
    box = g[y:y + s, x:x + s]
    hp = box - cv2.GaussianBlur(box, (0, 0), 3)
    win = np.outer(np.hanning(s), np.hanning(s)).astype(np.float32)
    spec = np.abs(np.fft.fftshift(np.fft.fft2(hp * win))) ** 2
    c = s // 2
    spec[c - 1:c + 2, c - 1:c + 2] = 0
    med = float(np.median(spec)) or 1e-9
    iy, ix = np.unravel_index(int(np.argmax(spec)), spec.shape)
    fy, fx = (iy - c) / s, (ix - c) / s
    f = math.hypot(fx, fy)
    edges = [np.hypot(cv2.Sobel(rgb[..., i].astype(np.float32), cv2.CV_32F, 1, 0),
                      cv2.Sobel(rgb[..., i].astype(np.float32), cv2.CV_32F, 0, 1)) for i in range(3)]
    hann = cv2.createHanningWindow((w, h), cv2.CV_32F)
    (rx, ry), _ = cv2.phaseCorrelate(edges[1], edges[0], hann)
    (bx, by), _ = cv2.phaseCorrelate(edges[1], edges[2], hann)
    return {"halftone_ratio": round(float(spec[iy, ix]) / med, 1), "halftone_period_px": round(1 / f, 2) if f > 0 else None,
            "halftone_angle_deg": round(math.degrees(math.atan2(fy, fx)) % 180, 1),
            "ca_px": round(max(math.hypot(rx, ry), math.hypot(bx, by)), 2)}


def finishing_stats(rgb, grey):
    """Grain, vignette, black and white points, Lab mean, saturation and edge width of one frame."""
    g = grey.astype(np.float32)
    blur = cv2.GaussianBlur(g, (0, 0), 3)
    resid = g - blur
    grad = np.hypot(cv2.Sobel(blur, cv2.CV_32F, 1, 0), cv2.Sobel(blur, cv2.CV_32F, 0, 1))
    flat = ((grad < 4.0) & (blur > 16) & (blur < 239)).astype(np.uint8)
    flat = cv2.erode(flat, np.ones((5, 5), np.uint8)).astype(bool)
    grain = round(float(resid[flat].std()), 3) if flat.mean() >= 0.02 else None
    h, w = g.shape
    k = max(4, min(h, w) // 10)
    corners = [g[:k, :k], g[:k, -k:], g[-k:, :k], g[-k:, -k:]]
    centre = g[h // 2 - k // 2:h // 2 + k // 2, w // 2 - k // 2:w // 2 + k // 2]
    cmean = float(centre.mean())
    vignette = round(float(np.mean([c.mean() for c in corners])) / cmean, 3) if cmean >= 10 else None
    p1, p99 = (float(v) for v in np.percentile(g, [1, 99]))
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float32)
    sat = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)[..., 1].astype(np.float32)
    mag = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1)) / 8.0
    contrast = cv2.dilate(g, np.ones((7, 7), np.uint8)) - cv2.erode(g, np.ones((7, 7), np.uint8))
    strong = (mag >= np.percentile(mag, 99)) & (contrast >= 30) & (mag > 1.0)
    edge = round(float(np.median(contrast[strong] / mag[strong])), 2) if strong.sum() >= 20 else None
    return {"grain": grain, "vignette": vignette, "black_point": round(p1, 1), "white_point": round(p99, 1),
            "lab_l": round(float(lab[:, 0].mean()) * 100 / 255, 2), "lab_a": round(float(lab[:, 1].mean()) - 128, 2),
            "lab_b": round(float(lab[:, 2].mean()) - 128, 2), "saturation": round(float(sat.mean()) / 255, 3),
            "edge_width_px": edge} | screen_and_fringe(rgb, g, flat)


def keep_persistent(detail):
    """Detected text boxes stay only when a box at the same place shows on the sample before or after."""
    raw = [d.get("text_boxes") or [] for d in detail]
    for k, d in enumerate(detail):
        if "text_boxes" not in d:
            continue
        near = (raw[k - 1] if k else []) + (raw[k + 1] if k + 1 < len(raw) else [])
        d["text_boxes"] = [b for b in raw[k] if any(iou(b, o) >= 0.5 for o in near)]


def median_or_none(values, nd=3):
    vals = [v for v in values if v is not None]
    return round(float(np.median(vals)), nd) if vals else None


def glow_radius(grey, box):
    """(halo radius in px of this grey frame, text luma) around light text on a darker ground in one box, or None when
    the box holds no row of letters or its text is not lighter than its ground (measuring.md section 9, glow radius)."""
    H, W = grey.shape
    x, y, w, h = (int(round(v)) for v in box)
    x, y = max(0, x), max(0, y)
    w, h = min(w, W - x), min(h, H - y)
    if w < 12 or h < 8:
        return None
    inner = grey[y:y + h, x:x + w]
    if not letters_row(inner):
        return None
    pad = max(6, int(round(0.8 * h)))
    crop = grey[max(0, y - pad):min(H, y + h + pad), max(0, x - pad):min(W, x + w + pad)].astype(np.float32)
    ground, top = float(np.percentile(crop, 20)), float(np.percentile(inner, 99.5))
    if top - ground < 60:
        return None
    core = (crop >= ground + 0.8 * (top - ground)).astype(np.uint8)
    if core.sum() < 8:
        return None
    dist = cv2.distanceTransform(1 - core, cv2.DIST_L2, 3)
    level = ground + 0.1 * (top - ground)
    for r in range(1, pad + 1):
        ring = (dist > r - 1) & (dist <= r)
        if ring.sum() < 5 or float(crop[ring].mean()) <= level:
            return r, top
    return pad, top


# ---------------------------------------------------------------- depth from pixels
DEPTH_WIDTH = 480            # dense flow width (measuring.md section 12: every frame of the passage at 480 px)
DEPTH_EVERY = 0.1            # seconds between the two frames of a depth pair
DEPTH_MIN_FIELD = 0.25       # px at DEPTH_WIDTH: the median motion of the field before its planes are read
SCREEN_RATE = 0.1            # a point moving under a tenth of the field sits on the screen layer (a caption, a mark)
PLANE_MIN_SHARE = 0.05       # a plane holds at least this share of the points
PLANE_SEP = math.log(1.25)   # planes differ in rate by 25 percent or more
NEAR_MIN = 1.25              # the near plane of a push-through moves at least this many times the slowest
PUSH_SCALE = 1.3             # and grows by this much over the push
DEPTH_KEYS = ("camera_moving_share", "layers", "parallax_ratio", "push_through")


def depth_pair(a, b):
    """Planes of one sample pair (grey frames DEPTH_WIDTH wide). Dense optical flow (Farneback), the camera's
    similarity fitted to the flow of the textured points (RANSAC), then each point's rate along that field: the
    projection of its flow on the field over the field's length. -> {"field_px", "zoom", "planes": [{"rate",
    "share", "bbox"}] or None, "screen_share"}; bbox in frame shares [x0, y0, x1, y1]."""
    out = {"field_px": 0.0, "zoom": 0.0, "planes": None, "screen_share": 0.0}
    h, w = a.shape
    flow = cv2.calcOpticalFlowFarneback(a, b, None, 0.5, 4, 15, 3, 5, 1.2, 0)
    ys, xs = np.mgrid[2:h:4, 2:w:4]
    ys, xs = ys.ravel(), xs.ravel()
    eig = cv2.cornerMinEigenVal(a, 5, 3)
    valid = eig[ys, xs] > max(1e-4, 0.02 * float(np.percentile(eig, 99)))
    if valid.sum() < 200:
        return out
    f = flow[ys, xs].astype(np.float32)
    p0 = np.stack([xs, ys], 1).astype(np.float32)
    M, _ = cv2.estimateAffinePartial2D(p0[valid], p0[valid] + f[valid], method=cv2.RANSAC, ransacReprojThreshold=1.0)
    if M is None:
        return out
    g = p0 @ M[:, :2].T.astype(np.float32) + M[:, 2].astype(np.float32) - p0
    gm = np.hypot(g[:, 0], g[:, 1])
    out["field_px"] = round(float(np.median(gm[valid])), 3)
    out["zoom"] = round(math.log(max(1e-6, math.hypot(M[0, 0], M[1, 0]))), 5)
    if out["field_px"] < DEPTH_MIN_FIELD:
        return out
    use = valid & (gm >= DEPTH_MIN_FIELD)
    r = (f[:, 0] * g[:, 0] + f[:, 1] * g[:, 1]) / np.maximum(gm * gm, 1e-9)
    perp = np.hypot(f[:, 0] - r * g[:, 0], f[:, 1] - r * g[:, 1])
    aligned = use & (perp <= 0.35 * np.maximum(np.hypot(f[:, 0], f[:, 1]), gm))
    good = aligned & (r >= SCREEN_RATE) & (r <= 10.0)
    out["screen_share"] = round(float((aligned & (r < SCREEN_RATE)).sum()) / max(1, int(aligned.sum())), 3)
    if good.sum() < 150:
        return out
    lr = np.log(r[good])
    edges = np.arange(math.log(SCREEN_RATE), math.log(10.0) + 0.05, 0.05)
    hist, _ = np.histogram(lr, edges)
    sm = np.convolve(hist.astype(np.float32), np.array([1, 2, 3, 2, 1], np.float32) / 9, mode="same")
    centres = (edges[:-1] + edges[1:]) / 2
    peaks = [i for i in range(len(sm)) if sm[i] > 0 and sm[i] >= sm[max(0, i - 1)] and sm[i] >= sm[min(len(sm) - 1, i + 1)]]
    kept = []
    for i in sorted(peaks, key=lambda i: -sm[i]):
        if all(abs(centres[i] - centres[j]) >= PLANE_SEP for j in kept):
            kept.append(i)
    levels = np.array([centres[i] for i in sorted(kept)])
    nearest = np.argmin(np.abs(lr[:, None] - levels[None, :]), 1)
    gx, gy = xs[good], ys[good]
    planes = []
    for j in range(len(levels)):
        sel = nearest == j
        share = float(sel.mean())
        if share < PLANE_MIN_SHARE:
            continue
        box = [float(np.percentile(gx[sel], 2)) / w, float(np.percentile(gy[sel], 2)) / h,
               float(np.percentile(gx[sel], 98)) / w, float(np.percentile(gy[sel], 98)) / h]
        planes.append({"rate": round(float(np.exp(np.median(lr[sel]))), 3), "share": round(share, 3),
                       "bbox": [round(v, 3) for v in box]})
    out["planes"] = planes or None
    return out


def touches_edge(box, margin=0.03):
    return box[0] <= margin or box[1] <= margin or box[2] >= 1 - margin or box[3] >= 1 - margin


def depth_summary(pairs, shots, cuts, camera_share, every):
    """Film and per-shot depth from the sample pairs (depth_pair results with "t0", "t1"). Adds "layers",
    "parallax_ratio" and "push_through" to each shot; returns the film's block."""
    eps = 1e-6
    for p in pairs:
        p["shot"] = None
        if any(p["t0"] + eps < c <= p["t1"] + eps for c in cuts):
            continue      # the pair spans a cut
        for k, s in enumerate(shots):
            if s["start"] - eps <= p["t0"] and p["t1"] <= s["end"] + eps:
                p["shot"] = k
                break

    def pushes_in(moving):
        """Push-throughs: runs of consecutive pairs pushing in (zoom rate over ZOOM_T) whose nearest plane, at least
        NEAR_MIN times the slowest, grows by PUSH_SCALE or more and touches the frame edge."""
        count, run = 0, None
        def counts(r):
            return bool(r) and r["end"] - r["start"] >= MOVE_MIN_S - eps and r["edge"] and math.exp(r["log_scale"]) >= PUSH_SCALE
        for p in moving:
            push = p["zoom"] / max(eps, p["t1"] - p["t0"]) > ZOOM_T
            if not (push and run is not None and abs(p["t0"] - run["end"]) < eps):
                count += counts(run)
                run = {"start": p["t0"], "end": p["t0"], "log_scale": 0.0, "edge": False} if push else None
            if run is not None:
                run["end"] = p["t1"]
                near, far = p["planes"][-1], p["planes"][0]
                if len(p["planes"]) >= 2 and near["rate"] >= NEAR_MIN * far["rate"]:
                    run["log_scale"] += near["rate"] * p["zoom"]
                    run["edge"] = run["edge"] or touches_edge(near["bbox"])
        return count + counts(run)

    film_ratios, pushes, moving_total = [], 0, 0
    for k, s in enumerate(shots):
        moving = sorted((p for p in pairs if p["shot"] == k and p["planes"]), key=lambda p: p["t0"])
        moving_total += len(moving)
        layers = 1
        if len(moving) >= 3:
            counts = sorted((len(p["planes"]) for p in moving), reverse=True)
            layers = max(1, counts[(len(counts) - 1) // 2])
        ratios = [p["planes"][-1]["rate"] / p["planes"][0]["rate"] for p in moving if len(p["planes"]) >= 2]
        ratio = round(float(np.median(ratios)), 3) if layers >= 2 and ratios else None
        if ratio is not None:
            film_ratios += ratios
        count = pushes_in(moving)
        pushes += count
        s.update(layers=layers, parallax_ratio=ratio, push_through=count, depth_pairs=len(moving))
    return {
        "camera_moving_share": camera_share,
        "layers": max([s["layers"] for s in shots] or [1]),
        "parallax_ratio": round(float(np.median(film_ratios)), 3) if film_ratios else None,
        "push_through": pushes,
        "pairs": len(pairs), "moving_pairs": moving_total,
        "screen_share": median_or_none([p["screen_share"] for p in pairs if p["planes"]]),
        "shots": [{"id": s["id"], "start": s["start"], "end": s["end"], "layers": s["layers"],
                   "parallax_ratio": s["parallax_ratio"], "push_through": s["push_through"],
                   "moving_pairs": s["depth_pairs"]} for s in shots],
        "settings": {"width": DEPTH_WIDTH, "pair_s": DEPTH_EVERY, "min_field_px": DEPTH_MIN_FIELD,
                     "plane_min_share": PLANE_MIN_SHARE, "plane_separation": 1.25},
    }


def write_depth_file(m, path):
    """Write the depth file (motion-density.md section 8 format): the measured keys from pixels, elements_3d, dof and
    triggers kept from the file at path when it exists. -> (path, None) or (None, the reason it was not written)."""
    path = Path(path)
    old = read_json_soft(path) if path.is_file() else None
    old = old if isinstance(old, dict) else {}
    d = m["depth"]
    data = dict(old)
    data.update({k: d[k] for k in DEPTH_KEYS})
    data.setdefault("elements_3d", [])
    if not isinstance(data.get("dof"), dict):
        data["dof"] = {"present": False, "blur_px": None}
    data.setdefault("triggers", [])
    data["measured"] = {"tool": "craft_gate.py measure", "version": VERSION, "video": m["file"], "keys": list(DEPTH_KEYS),
                        "kept_from_file": sorted(k for k in ("elements_3d", "dof", "triggers") if k in old),
                        "per_shot": d["shots"], "screen_share": d["screen_share"], "moving_pairs": d["moving_pairs"]}
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    except OSError as e:
        return None, str(e)
    return str(path), None


# ---------------------------------------------------------------- measure
def measure(path, every=0.1, width=320, want_text=False, face_lookup=None, declared_cuts=(), text_lookup=None,
            probe_hook=None):
    """Pixel measures of one video. face_lookup(t) -> boxes replaces face detection (build --faces); declared_cuts are
    cut times in seconds from the plan files, added to the detected ones; text_lookup(t) -> boxes gives the text and
    card boxes (build --boxes) for the glow measure; probe_hook(t, rgb, grey, faces, scale) runs on every detail sample
    (build's speaker and fixed-mark probes; faces in the video's pixels, scale = video px per detail px)."""
    W, H, dur, fps = probe(path)
    dw = min(W, DETAIL_WIDTH) // 2 * 2
    dh = even(H * dw / W)
    cw = min(width, dw) // 2 * 2
    ch = even(H * cw / W)
    detail_step = max(1, int(round(FACE_DETECT_EVERY / every)))
    finish_step = detail_step * max(1, int(round(FINISH_EVERY / (detail_step * every))))   # on detail samples only
    depth_w = min(DEPTH_WIDTH, dw) // 2 * 2
    depth_h = even(dh * depth_w / dw)
    depth_step = max(1, int(round(DEPTH_EVERY / every)))
    cascades = load_cascades() if face_lookup is None else None
    steps, detail, prev, pairs, prev_depth = [], [], None, [], None
    sx, sy = W / dw, H / dh
    for i, rgb in enumerate(stream_frames(path, 1.0 / every, dw, dh)):
        t = round(i * every, 3)
        grey = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        small = cv2.resize(grey, (cw, ch), interpolation=cv2.INTER_AREA) if (cw, ch) != (dw, dh) else grey
        if prev is not None:
            steps.append(camera_step(prev, small))
        prev = small
        if i % depth_step == 0:
            dg = cv2.resize(grey, (depth_w, depth_h), interpolation=cv2.INTER_AREA) if (depth_w, depth_h) != (dw, dh) else grey
            if prev_depth is not None:
                pairs.append({"t0": prev_depth[0], "t1": t, **depth_pair(prev_depth[1], dg)})
            prev_depth = (t, dg)
        if i % detail_step:
            continue
        fk = min(1.0, FACE_WIDTH / dw)
        face_grey = cv2.resize(grey, (int(dw * fk) // 2 * 2, even(dh * fk)), interpolation=cv2.INTER_AREA) if fk < 1 else grey
        fsx, fsy = W / face_grey.shape[1], H / face_grey.shape[0]
        if face_lookup is not None:
            faces = [list(b) for b in face_lookup(t)]
        else:
            faces = [[int(round(x * fsx)), int(round(y * fsy)), int(round(w * fsx)), int(round(h * fsy))]
                     for x, y, w, h in detect_faces(face_grey, cascades)]
        rec = {"t": t, "faces": faces}
        if faces:
            rec["focus_ratio"] = focus_ratio(grey, faces, sx, sy)
        if want_text:
            rec["text_boxes"] = [[int(round(x * fsx)), int(round(y * fsy)), int(round(w * fsx)), int(round(h * fsy))]
                                 for x, y, w, h in detect_text(face_grey)]
        boxes_now = text_lookup(t) if text_lookup is not None else rec.get("text_boxes")
        glows = [glow_radius(grey, (b[0] / sx, b[1] / sy, b[2] / sx, b[3] / sy)) for b in boxes_now or []]
        glows = [g for g in glows if g is not None]
        if glows:                                  # the brightest light text of the sample
            rec["glow_px"] = round(max(glows, key=lambda g: g[1])[0] * sx, 2)
        if i % finish_step == 0:
            rec["finish"] = finishing_stats(rgb, grey)
        if probe_hook is not None:
            probe_hook(t, rgb, grey, faces, (sx, sy))
        detail.append(rec)
    if len(steps) < 2:
        raise RuntimeError("too few frames to measure")
    if want_text:
        keep_persistent(detail)
    n_frames = len(steps) + 1
    dur = dur or n_frames * every
    cut_like, first_cut = detect_cuts(steps, every, declared_cuts)
    moving = moving_steps(steps, cut_like, every)
    moves, covered = find_moves(steps, moving, cut_like, every)
    shots = []
    for k, (s, e) in enumerate(shot_spans(first_cut, n_frames), 1):
        a, b = round(s * every, 3), round(min(e * every, dur), 3)
        span = slice(s, max(s, e - 1))
        runs = idle_runs(covered, cut_like, s, e, every)
        samples = [d for d in detail if a <= d["t"] < b]
        fin = [d["finish"] for d in samples if d.get("finish")]
        shots.append({
            "id": f"shot{k}", "start": a, "end": b, "duration": round(b - a, 3),
            "moving_share": round(float(covered[span].mean()), 3) if e - 1 > s else 0.0,
            "idle_runs": runs, "longest_idle_s": round(max((r[1] - r[0] for r in runs), default=0.0), 3),
            "moves": [m for m in moves if a <= m["start"] < b],
            "finish": {key: median_or_none([f[key] for f in fin]) for key in
                       ("grain", "vignette", "black_point", "white_point", "lab_l", "lab_a", "lab_b", "saturation",
                        "edge_width_px", "halftone_ratio", "halftone_period_px", "ca_px")} | {"samples": len(fin),
                                             "glow_px": median_or_none([d.get("glow_px") for d in samples], 2)},
            "face_samples": sum(1 for d in samples if d["faces"]),
            "focus_ratio": median_or_none([d.get("focus_ratio") for d in samples], 2),
        })
    flashes = measure_flashes(path, fps, W, H)
    not_cut = ~cut_like
    takes = [s for s in shots if s["duration"] > TAKE_MIN_S]
    worst_take = max(takes, key=lambda s: s["longest_idle_s"], default=None)
    all_fin = [d["finish"] for d in detail if d.get("finish")]
    cuts_s = [round((int(k) + 1) * every, 3) for k in np.where(first_cut)[0]]
    camera_share = round(float(covered[not_cut].mean()), 3) if not_cut.any() else 0.0
    depth = depth_summary(pairs, shots, cuts_s, camera_share, every)
    return {
        "tool": "craft_gate.py measure", "version": VERSION, "file": str(path),
        "video": {"width": W, "height": H, "duration_s": round(dur, 3), "fps": round(fps, 3)},
        "settings": {"every_s": every, "camera_width": cw, "detail_width": dw, "face_every_s": round(detail_step * every, 3),
                     "finish_every_s": round(finish_step * every, 3), "faces_from": "--faces" if face_lookup else "Haar cascades"},
        "camera": {
            "moving_share": camera_share,
            "cuts_s": cuts_s,
            "moves": moves,
            "steps": [{"t": round((k + 1) * every, 3), "scale": round(math.exp(s["zoom"]), 5), "dx": round(s["dx"], 5),
                       "dy": round(s["dy"], 5), "rot_deg": round(math.degrees(s["rot"]), 3), "valid": s["valid"],
                       "moving": bool(covered[k])} for k, s in enumerate(steps)],
        },
        "flashes": flashes,
        "depth": depth,
        "shots": shots,
        "detail": detail,
        "summary": {
            "shots": len(shots), "mean_shot_s": round(dur / max(1, len(shots)), 2), "cuts": int(first_cut.sum()),
            "camera_moving_share": camera_share,
            "moves": len(moves),
            "layers": depth["layers"], "parallax_ratio": depth["parallax_ratio"], "push_through": depth["push_through"],
            "longest_idle_in_long_take_s": worst_take["longest_idle_s"] if worst_take else None,
            "max_flashes_per_s": flashes["max_per_s"],
            "face_sample_share": round(sum(1 for d in detail if d["faces"]) / max(1, len(detail)), 3),
            "focus_ratio": median_or_none([d.get("focus_ratio") for d in detail], 2),
            "grain": median_or_none([f["grain"] for f in all_fin]),
            "vignette": median_or_none([f["vignette"] for f in all_fin]),
            "black_point": median_or_none([f["black_point"] for f in all_fin], 1),
            "white_point": median_or_none([f["white_point"] for f in all_fin], 1),
            "saturation": median_or_none([f["saturation"] for f in all_fin]),
            "glow_px": median_or_none([d.get("glow_px") for d in detail], 2),
            "halftone_ratio": median_or_none([f["halftone_ratio"] for f in all_fin], 1),
            "halftone_period_px": median_or_none([f["halftone_period_px"] for f in all_fin], 2),
            "ca_px": median_or_none([f["ca_px"] for f in all_fin], 2),
        },
    }


def measure_lines(m):
    s, v = m["summary"], m["video"]
    return [f"craft_gate.py measure: {m['file']} ({v['width']}x{v['height']}, {v['duration_s']} s, {v['fps']} fps)",
            f"  shots {s['shots']} (mean {s['mean_shot_s']} s), camera moving share {s['camera_moving_share']}, moves {s['moves']}, "
            f"longest idle in a take over {TAKE_MIN_S:g} s: {s['longest_idle_in_long_take_s']}",
            f"  depth: layers {s['layers']}, parallax ratio {s['parallax_ratio']}, push-throughs {s['push_through']} "
            f"({m['depth']['moving_pairs']} of {m['depth']['pairs']} sample pairs with a moving field)",
            f"  flashes: max {s['max_flashes_per_s']} in any 1 s; faces on {s['face_sample_share']} of samples, focus ratio "
            f"{s['focus_ratio']}",
            f"  finish: grain {s['grain']}, vignette {s['vignette']}, black {s['black_point']}, white {s['white_point']}, "
            f"saturation {s['saturation']}, glow {s['glow_px']} px"]


# ---------------------------------------------------------------- build check
def read_box_file(path, key):
    """Samples [{"t", key: [[x, y, w, h], ...], "width", "height"}] from a list, a {"samples": [...]} object or one sample."""
    data = read_json(path, f"--{key} file")
    if isinstance(data, dict):
        samples = data.get("samples") if isinstance(data.get("samples"), list) else [data]
    elif isinstance(data, list):
        samples = data
    else:
        raise Unreadable(f"--{key} file {path}: expected a list of samples")
    out = []
    for s in samples:
        if not isinstance(s, dict) or not isinstance(s.get("t"), (int, float)):
            raise Unreadable(f"--{key} file {path}: every sample needs a number \"t\"")
        boxes = s.get(key) or []
        if not isinstance(boxes, list) or not all(isinstance(b, list) and len(b) == 4 and
                                                  all(isinstance(v, (int, float)) for v in b) for b in boxes):
            raise Unreadable(f"--{key} file {path}: \"{key}\" must be a list of [x, y, w, h] at t={s['t']}")
        out.append({"t": float(s["t"]), "boxes": boxes, "width": s.get("width"), "height": s.get("height")})
    return sorted(out, key=lambda s: s["t"])


def box_lookup(samples, W, H):
    """t -> boxes in the render's pixels from the nearest sample (within the file's own spacing)."""
    if not samples:
        return lambda t: []
    times = [s["t"] for s in samples]
    gaps = sorted(b - a for a, b in zip(times, times[1:]))
    tol = max(0.5, gaps[len(gaps) // 2]) if gaps else float("inf")
    scaled = []
    for s in samples:
        kx = W / s["width"] if isinstance(s["width"], (int, float)) and s["width"] else 1.0
        ky = H / s["height"] if isinstance(s["height"], (int, float)) and s["height"] else kx
        scaled.append([[b[0] * kx, b[1] * ky, b[2] * kx, b[3] * ky] for b in s["boxes"]])
    def at(t):
        k = min(range(len(times)), key=lambda i: abs(times[i] - t))
        return scaled[k] if abs(times[k] - t) <= tol else []
    return at


def held_faces(m):
    """[(t, faces, held)]: detected faces held through the shot until the next cut."""
    cuts = m["camera"]["cuts_s"]
    out, held, held_since = [], [], None
    for d in m["detail"]:
        t = d["t"]
        if d["faces"]:
            held, held_since = d["faces"], t
            out.append((t, d["faces"], False))
        elif held and not any(held_since < c <= t for c in cuts):
            out.append((t, held, True))
        else:
            held = []
            out.append((t, [], False))
    return out


def ranges_text(times, step):
    """Consecutive sample times joined into 'a-b s' ranges."""
    spans = []
    for t in times:
        if spans and t - spans[-1][1] <= step * 1.5:
            spans[-1][1] = t
        else:
            spans.append([t, t])
    return ", ".join(f"{a:g}-{b + step:g} s" for a, b in spans[:6]) + (" and more" if len(spans) > 6 else "")


def check_faces(m, boxes_at, W, H):
    step = m["settings"]["face_every_s"]
    band = {"mouth and chin": [], "eye": []}
    examples, worst = {}, []
    any_face = False
    for t, faces, held in held_faces(m):
        boxes = boxes_at(t)
        low = 1.0
        for f in faces:
            any_face = True
            low = min(low, 1.0 - covered_share(face_zone(f, W, H), boxes))
            for b in boxes:
                for name, zone in (("mouth and chin", mouth_band(f)), ("eye", eye_band(f))):
                    if overlaps(b, zone):
                        band[name].append(t)
                        examples.setdefault(name, (b, f))
        worst.append((t, low if faces else 1.0))
    items = []
    for name, times in band.items():
        if times:
            b, f = examples[name]
            items.append(f"a text or card box sits on the {name} band at {ranges_text(sorted(set(times)), step)} "
                         f"(box {[round(v) for v in b]}, face {[round(v) for v in f]})")
    run, runs = [], []
    for t, unc in worst + [(None, 1.0)]:
        if unc < COVER_MIN:
            run.append(t)
        elif run:
            if (run[-1] - run[0]) + step >= COVER_WINDOW_S - 1e-6:
                runs.append((run[0], run[-1] + step))
            run = []
    for a, b in runs[:6]:
        items.append(f"the face zone is less than {COVER_MIN:.0%} uncovered from {a:g} to {b:g} s (at most "
                     f"{COVER_WINDOW_S:g} s allowed)")
    source = "--boxes" if m.get("boxes_from") == "--boxes" else "text-region detector"
    return {"ok": not items, "items": items, "faces_found": any_face, "boxes_from": source,
            "faces_from": m["settings"]["faces_from"]}


def plan_with_ranges(plan, files, duration):
    """The plan with each exemption row's shot ids that the plan files time ("S3", a scene or cue id) added to its
    "shots" as 'a-b' ranges, so a gate that knows only times can read them."""
    if not isinstance(plan, dict) or not isinstance(plan.get("exemptions"), list) or files is None:
        return plan
    rows = []
    for x in plan["exemptions"]:
        shots = x.get("shots") if isinstance(x, dict) else None
        if isinstance(shots, list):
            extra = []
            for s in shots:
                found, rng, _ = files.resolve(s, duration)
                if found and rng and math.isfinite(rng[1]):
                    extra.append(f"{rng[0]:g}-{rng[1]:g}")
            x = dict(x, shots=shots + extra) if extra else x
        rows.append(x)
    return dict(plan, exemptions=rows)


def check_flashes(m, plan, files=None):
    """Red for every 1 s window over the limit, except the windows a user row lifting frame:flash covers (its shots
    hold the window's flashes, and its amount, when given, holds their count)."""
    f = m["flashes"]
    warnings, items, lifted = [], [], []
    for x in (plan or {}).get("exemptions") or []:
        if not isinstance(x, dict) or not any(str(l).replace(" ", "").lower() == "frame:flash" for l in
                                              (x.get("lifts") if isinstance(x.get("lifts"), list) else [x.get("lifts")])):
            continue
        whole, per = exemption_issues(x) if exemption_issues else ("the shared reader cannot be imported", {})
        why = whole or next((w for l, w in per.items() if l.replace(" ", "").lower() == "frame:flash"), None)
        if why:
            warnings.append(f"exemption {x.get('id', '?')} lifts frame:flash but is ignored ({why}): only the user's own "
                            "words turn on the faithful strobe (photosensitivity is a hard rule)")
    p = plan_with_ranges(plan, files, m["video"]["duration_s"])
    times = f.get("transition_times_s") or []
    for a, b, n in f["over_limit"]:
        inside = [t for t in times if a - 1e-6 <= t <= b + 1e-6]
        span = (min(inside), max(inside)) if inside else (a, b)
        row = exemption_for(p, "frame:flash", t=span, value=n) if p and exemption_for else None
        if row:
            lifted.append(f"{exempt_line('frame:flash', row)}: {n} flashes from {a:g} to {b:g} s")
        else:
            items.append(f"{n} flashes from {a:g} to {b:g} s (at most {FLASH_LIMIT} in any 1 s window)")
    if lifted:
        warnings.append("faithful strobe by the user's words: " + "; ".join(lifted[:6]) +
                        "; the delivery note must state the mode and the flash count")
    return {"ok": not items, "items": items[:6] + ([f"and {len(items) - 6} more windows"] if len(items) > 6 else []),
            "exempt": lifted, "warnings": warnings, "max_per_s": f["max_per_s"], "first_3s_flashes": f["first_3s_flashes"]}


def is_speaker_edit(route, subtype, plan):
    kind = " ".join(text_of(v) for v in (subtype, (plan or {}).get("type")))
    return str(route or (plan or {}).get("route") or "").lower() == "edit" and bool(SPEAKER_TYPES.search(kind))


def is_hold(event):
    return str(event.get("kind") or event.get("type") or "").strip().lower() == "hold"


def declared_events(files, render):
    """([times], [sources]) of declared visible events: the edit plan's "events" (by "time"), the cue sheet's event
    times ("t") and <render>.events.json next to the render ("t" or "time"; a bare list or {"events": [...]}). Holds do
    not count."""
    times, src = [], []
    def take(events, key_order, label):
        got = []
        for e in events or []:
            if not isinstance(e, dict) or is_hold(e):
                continue
            v = next((e[k] for k in key_order if isinstance(e.get(k), (int, float)) and not isinstance(e.get(k), bool)), None)
            if v is not None:
                got.append(float(v))
        if got:
            times.extend(got)
            src.append(f"{label} ({len(got)})")
    take((files.edit_plan or {}).get("events"), ("time", "t"), f"edit plan events in {files.edit_plan_path}")
    take((files.cue or {}).get("events"), ("t", "time"), "ice/plan/cue-sheet.json events")
    for p in (render.with_suffix(".events.json"), render.parent / (render.name + ".events.json")):
        data = read_json_soft(p) if p.is_file() else None
        evs = data.get("events") if isinstance(data, dict) else data
        if isinstance(evs, list):
            take(evs, ("t", "time"), str(p))
            break
    return sorted(set(round(t, 3) for t in times)), src


def box_changes(samples, W, H):
    """Times at which a text or card box appears or leaves: the later of two consecutive samples whose boxes do not
    match (a box with no partner at IoU 0.5 or more). samples: [(t, boxes, width, height)] in time order."""
    out, prev = [], None
    for t, boxes, w, h in samples:
        kx = W / w if isinstance(w, (int, float)) and w else 1.0
        ky = H / h if isinstance(h, (int, float)) and h else kx
        cur = [[b[0] * kx, b[1] * ky, b[2] * kx, b[3] * ky] for b in boxes]
        if prev is not None and (any(all(iou(a, b) < 0.5 for b in cur) for a in prev) or
                                 any(all(iou(b, a) < 0.5 for a in prev) for b in cur)):
            out.append(round(float(t), 3))
        prev = cur
    return out


def split_runs(runs, changes):
    """Idle runs cut at every change time inside them."""
    out = []
    for a, b in runs:
        pts = [a] + sorted(c for c in changes if a + 1e-6 < c < b - 1e-6) + [b]
        out += [(round(x, 3), round(y, 3)) for x, y in zip(pts, pts[1:]) if y > x]
    return out


def camera_limit(row, route, subtype, plan, ref_idle):
    """(limit in seconds or None, where it comes from): idle_max_s, else the reference, else the speaker default."""
    decision = str((row or {}).get("decision", "")).strip()
    v = (row or {}).get("idle_max_s")
    if isinstance(v, (int, float)) and not isinstance(v, bool) and v > 0:
        return float(v), f"the camera row's idle_max_s ({v:g} s)"
    if decision == "not_use":
        return None, None
    if ref_idle:
        return round(ref_idle[0] * 1.10, 3), f"the reference's measured longest idle ({ref_idle[0]:g} s, {ref_idle[1]}) plus 10 percent"
    if is_speaker_edit(route, subtype, plan):
        return SPEAKER_IDLE_S, f"the speaker-edit default of {SPEAKER_IDLE_S:g} s"
    return None, None


def check_camera(m, rows, route, subtype, plan, changes=(), change_from=(), ref_idle=None):
    """Takes over 8 s whose idle runs, cut at camera moves, cuts and the change times (declared events, boxes in or
    out), are longer than the limit (camera_limit)."""
    limit, why = camera_limit(rows.get("camera"), route, subtype, plan, ref_idle)
    takes = [s for s in m["shots"] if s["duration"] > TAKE_MIN_S]
    items, per_take = [], []
    for s in takes:
        runs = split_runs(s["idle_runs"], changes)
        longest = round(max((r[1] - r[0] for r in runs), default=0.0), 3)
        per_take.append({"start": s["start"], "end": s["end"], "longest_idle_s": longest})
        if limit is not None and longest > limit + 1e-6:
            run = max(runs, key=lambda r: r[1] - r[0])
            items.append(f"take {s['start']:g}-{s['end']:g} s sits idle for {longest:g} s ({run[0]:g}-{run[1]:g} s: no "
                         f"camera move, cut, declared event or graphic in or out), over {why}: add a visible change every "
                         "3 to 5 s (a move on a word, or a graphic)")
    longest = max((x["longest_idle_s"] for x in per_take), default=None)
    return {"ok": not items, "items": items, "limit_s": limit, "limit_from": why, "takes_over_8s": len(takes),
            "longest_idle_s": longest, "takes": per_take, "changes_s": list(changes)[:200], "changes_from": list(change_from)}


CODE_KEYS = {"music": ("music", "bed"), "voice": ("voice", "vo", "dialogue", "speech"), "sfx": ("sfx", "effects"),
             "ambience": ("ambience", "room_tone", "roomtone", "ambient"), "foley": ("foley",),
             "silence": ("silence", "silences", "quiet")}


def truthy(v):
    if isinstance(v, dict):
        return bool(v.get("present", True)) and bool(v)
    return bool(v)


def craft_tag_codes(value):
    out = set()
    for v in value if isinstance(value, list) else [value]:
        for part in re.split(r"[,\s]+", str(v or "")):
            code = part.strip().lower().removeprefix("craft:")
            if code in CRAFT_CODES:
                out.add(code)
    return out


def find_key(obj, key):
    if isinstance(obj, dict):
        if key in obj:
            return obj[key]
        for v in obj.values():
            hit = find_key(v, key)
            if hit is not None:
                return hit
    elif isinstance(obj, list):
        for v in obj:
            hit = find_key(v, key)
            if hit is not None:
                return hit
    return None


def lint_marks(lint):
    marks = find_key(lint, "craft_marks") if lint is not None else None
    if isinstance(marks, dict):
        return {k for k, v in marks.items() if k in CRAFT_CODES and v}
    out = set()
    for v in marks or []:
        out |= craft_tag_codes(v.get("code") or v.get("dimension") if isinstance(v, dict) else v)
    return out


def plan_tags(files):
    """{code: [where]} from "craft" tags on the edit plan's scenes and events, shots.json shots and cue-sheet events."""
    tags = {}
    def add(value, where):
        for code in craft_tag_codes(value):
            tags.setdefault(code, []).append(where)
    plan = files.edit_plan or {}
    for k, s in enumerate(plan.get("scenes") or []):
        if isinstance(s, dict):
            add(s.get("craft"), f"edit scene {s.get('id', k)}")
    for k, e in enumerate(plan.get("events") or []):
        if isinstance(e, dict):
            add(e.get("craft"), f"edit event {e.get('id', f'e{k:02d}')}")
    for s in (files.shots or {}).get("shots") or []:
        if isinstance(s, dict):
            add(s.get("craft"), f"shots.json {s.get('id')}")
            for el in s.get("elements") or []:
                if isinstance(el, dict):
                    add(el.get("craft"), f"shots.json {s.get('id')} element")
    for e in (files.cue or {}).get("events") or []:
        if isinstance(e, dict):
            add(e.get("craft"), f"cue {e.get('id', e.get('t'))}")
    return tags


def sound_presence(ice, files):
    """{code: evidence} for sound codes from the cue sheet and ice/review/audio-audit.json."""
    found = {}
    cue = files.cue or {}
    music = cue.get("music")
    src = text_of(music.get("source") if isinstance(music, dict) else music).strip().lower()
    if src and src != "none":
        found["music"] = "cue sheet music source"
    if cue.get("voice"):
        found["voice"] = "cue sheet voice lines"
    if cue.get("quiet"):
        found["silence"] = f"{len(cue['quiet'])} declared silences in the cue sheet"
    for e in cue.get("events") or []:
        if not isinstance(e, dict):
            continue
        sound = text_of(e.get("sound")).strip().lower()
        blob = " ".join(text_of(e.get(k)) for k in ("sound", "kind", "what")).lower()
        if sound and not sound.startswith("none"):
            found.setdefault("sfx", "cue sheet events with a sound")
        if "foley" in blob:
            found.setdefault("foley", "cue sheet foley events")
        if re.search(r"ambien|room tone", blob):
            found.setdefault("ambience", "cue sheet ambience events")
    audit = read_json_soft(ice / "review" / "audio-audit.json") if ice else None
    if isinstance(audit, dict):
        presence = audit.get("presence") if isinstance(audit.get("presence"), dict) else {}
        for code, keys in CODE_KEYS.items():
            for k in keys:
                if truthy(presence.get(k)) or (k in audit and truthy(audit[k])):
                    found.setdefault(code, f"ice/review/audio-audit.json ({k})")
    return found


GRAIN_WORDS = re.compile(r"grain", re.I)
VIGNETTE_WORDS = re.compile(r"vignet", re.I)
FOCUS_WORDS = re.compile(r"defocus|depth of field|\bdof\b|bokeh|rack focus|background blur|shallow focus|focus pull", re.I)


def in_ranges(t0, t1, ranges):
    return any(t0 < b and t1 > a for a, b in ranges)


def check_evidence(plan, m, files, lint, boxes_given):
    """One entry per use or scoped row: its evidence on the render, or red."""
    if not plan:
        return []
    dur = m["video"]["duration_s"]
    marks, tags, sound = lint_marks(lint), plan_tags(files), sound_presence(files.ice, files)
    text_found = boxes_given or any(d.get("text_boxes") for d in m["detail"])
    out = []
    for row in plan.get("rows") or []:
        if not isinstance(row, dict) or str(row.get("decision", "")).strip() not in ("use", "scoped"):
            continue
        code = str(row.get("dimension", "")).strip()
        resolved = [(w,) + files.resolve(w, dur)[1:] for w in where_list(row)]
        ranges = [r for _, r, _ in resolved if r]
        if not ranges:
            ranges = [(0.0, dur)]
        devices = text_of(row.get("devices"))
        ok, ev = False, ""
        if code == "camera":
            hit = [mv for mv in m["camera"]["moves"] if in_ranges(mv["start"], mv["end"], ranges)]
            bare = [w for w, r, _ in resolved if r and not any(in_ranges(mv["start"], mv["end"], [r]) for mv in m["camera"]["moves"])]
            ok = bool(hit) and not bare
            ev = (f"camera moves in its where ranges: {len(hit)}" + (f"; none in {', '.join(map(str, bare))}" if bare else "")
                  if hit else "no camera move measured in its where ranges")
        elif code == "finish":
            samples = [s for s in m["shots"] if in_ranges(s["start"], s["end"], ranges) and s["finish"]["samples"]]
            ok, parts = bool(samples), [f"grade measured on shots: {len(samples)}"] if samples else ["no graded shot measured"]
            grain = median_or_none([s["finish"]["grain"] for s in samples])
            vign = median_or_none([s["finish"]["vignette"] for s in samples])
            if GRAIN_WORDS.search(devices):
                good = grain is not None and grain > GRAIN_FLOOR
                ok = ok and good
                parts.append(f"grain {grain} ({'above' if good else 'not above'} the floor {GRAIN_FLOOR:g})")
            if VIGNETTE_WORDS.search(devices):
                good = vign is not None and vign < VIGNETTE_MAX
                ok = ok and good
                parts.append(f"vignette {vign} ({'under' if good else 'not under'} {VIGNETTE_MAX:g})")
            ev = "; ".join(parts)
        elif code == "light" and FOCUS_WORDS.search(devices):
            vals = [d.get("focus_ratio") for d in m["detail"] if d.get("focus_ratio") is not None
                    and in_ranges(d["t"], d["t"] + 1e-3, ranges)]
            ratio = median_or_none(vals, 2)
            ok = ratio is not None and ratio >= FOCUS_MIN
            ev = (f"focus ratio {ratio} (subject over background, at least {FOCUS_MIN:g})" if ratio is not None
                  else "no subject box to measure focus on (no face found: pass --faces with the subject's box)")
        elif code == "depth":
            deep = [s for s in m["shots"] if in_ranges(s["start"], s["end"], ranges)
                    and (s.get("layers", 1) >= 2 or s.get("push_through", 0) > 0)]
            ok = bool(deep)
            ev = ("depth measured from pixels on " + ", ".join(
                f"{s['id']} ({s['start']:g}-{s['end']:g} s): {s['layers']} planes, parallax {s['parallax_ratio']}, "
                f"push-throughs {s['push_through']}" for s in deep[:3]) if deep else "")
        elif code == "rhythm":
            ok, ev = True, f"shots {m['summary']['shots']}, mean {m['summary']['mean_shot_s']} s, cuts {m['summary']['cuts']} (measured)"
        elif code == "transition" and m["summary"]["cuts"]:
            ok, ev = True, f"cuts measured: {m['summary']['cuts']}"
        elif code == "type" and text_found:
            ok, ev = True, "text boxes on the render (" + ("--boxes" if boxes_given else "text-region detector") + ")"
        if not ok and code in SOUND_CODES and code in sound:
            ok, ev = True, sound[code]
        if not ok and code in marks:
            ok, ev = True, "lint.mjs craft mark (data-ice-craft)"
        if not ok and code in tags:
            ok, ev = True, "craft tag on " + ", ".join(tags[code][:3])
        if not ok and not ev:
            ev = ("no evidence: unmeasured is never n/a; " + (
                "add the cue-sheet entry or run the audio audit (ice/review/audio-audit.json)" if code in SOUND_CODES else
                "pass --lint with lint.mjs --json for an HTML build (data-ice-craft marks), or tag the edit plan's scenes "
                "and events or shots.json shots with \"craft\""))
        out.append({"dimension": code, "decision": row.get("decision"), "ok": ok, "evidence": ev})
    return out


# ---------------------------------------------------------------- finishing per shot and grade per source class
GRAIN_PRESENT = 2.0       # a clear added grain (measuring.md section 9: studio digital footage sits well under 1)
VIGNETTE_PRESENT = 0.85   # corners clearly darker than the centre
GLOW_PRESENT, GLOW_ABSENT = 0.004, 0.002   # halo radius over the frame width (sharp type reads about 1 px)
GLOW_PRESENT_PX, GLOW_ABSENT_PX = 3.0, 2.0  # and never under these in px
NAMED_SHARE = 0.5         # a measured shot is named when the named ranges cover this share of it
FINISH_EFFECTS = {"grain": GRAIN_WORDS, "vignette": VIGNETTE_WORDS, "glow": re.compile(r"glow|bloom|halo|halation", re.I)}
LOOK_WORDS = {"mono": re.compile(r"monochrome|black[- ]and[- ]white|\bb ?& ?w\b|\bb/w\b|gr[ae]yscale", re.I),
              "warm": re.compile(r"sepia|duotone|warm brown", re.I),
              "desat": re.compile(r"desaturat", re.I),
              "lift": re.compile(r"lift(?:ed)?\s+blacks?|raised\s+blacks?|blacks?\s+lifted", re.I)}
PRESET_LOOKS = {"outside_mono": ("mono",), "outside_desat_lift": ("desat", "lift"), "outside_warm_duotone": ("warm",)}
OWN_GRADES = ("", "none", "news_clean", "subtle", "neutral_punch", "auto")
OUTSIDE_CLASS = re.compile(r"outside|archive|agency|still|screenshot|portrait|stock|found", re.I)
LOOK_TEXT = {"mono": "monochrome (saturation at most 0.06)", "warm": "warm duotone (Lab b* at least 5 above the own world)",
             "desat": "desaturated (saturation at most 0.65 of the own world's)",
             "lift": "lifted blacks (black point at least 10 levels above the own world)",
             "distinct": "an outside treatment (differs from the own world in saturation, b* or black point)"}


def finish_row(plan):
    row = next((r for r in (plan or {}).get("rows") or [] if isinstance(r, dict) and r.get("dimension") == "finish"), None)
    return row if row and str(row.get("decision", "")).strip() in ("use", "scoped") else None


def ranges_of(items, files, dur):
    """([(a, b)], [unplaced ids]) for where items (ids, 'a-b' ranges, "film")."""
    got, unplaced = [], []
    for w in items:
        found, rng, _ = files.resolve(w, dur)
        if found and rng and math.isfinite(rng[1]):
            got.append((float(rng[0]), float(min(rng[1], dur))))
        else:
            unplaced.append(str(w))
    return got, unplaced


def finish_scopes(plan, files, dur):
    """Where each effect and each look is named. -> ({effect: [(a, b, source)]}, [(a, b, looks, source)], notes)."""
    scopes, looks, notes = {k: [] for k in FINISH_EFFECTS}, [], []
    row = finish_row(plan)
    if row:
        for dev in row.get("devices") or []:
            if isinstance(dev, dict):
                text, where = text_of(dev.get("device") or dev.get("effect")), dev.get("where") or where_list(row)
            else:
                text, where = text_of(dev), where_list(row)
            rngs, unplaced = ranges_of([str(w) for w in (where if isinstance(where, list) else [where])], files, dur)
            if unplaced:
                notes.append(f"finish device \"{text}\": no time for where id(s) {', '.join(unplaced)}, so it is not checked there")
            for effect, rx in FINISH_EFFECTS.items():
                if rx.search(text):
                    scopes[effect] += [(a, b, "the finish row") for a, b in rngs]
            named = {k for k, rx in LOOK_WORDS.items() if rx.search(text)}
            if named:
                looks += [(a, b, named, f"the finish row (\"{text}\")") for a, b in rngs]
    for s in (files.shots or {}).get("shots") or []:
        if not isinstance(s, dict) or not isinstance(s.get("start_s"), (int, float)) or not isinstance(s.get("end_s"), (int, float)):
            continue
        for f in s.get("finishing") or []:
            text = text_of(f.get("effect") if isinstance(f, dict) else f)
            for effect, rx in FINISH_EFFECTS.items():
                if rx.search(text):
                    scopes[effect].append((float(s["start_s"]), float(s["end_s"]), f"shots.json {s.get('id')}"))
            named = {k for k, rx in LOOK_WORDS.items() if rx.search(text)}
            if named:
                looks.append((float(s["start_s"]), float(s["end_s"]), named, f"shots.json {s.get('id')}"))
    return scopes, looks, notes


def cover(shot, ranges):
    """Share of the measured shot inside the ranges ((a, b, ...) tuples)."""
    a, b = shot["start"], shot["end"]
    if b <= a:
        return 0.0
    cuts = sorted((max(a, r[0]), min(b, r[1])) for r in ranges if min(b, r[1]) > max(a, r[0]))
    total, end = 0.0, a
    for x, y in cuts:
        x = max(x, end)
        if y > x:
            total, end = total + y - x, y
    return total / (b - a)


def check_finishing(m, plan, files):
    """Grain, glow and vignette per measured shot against where the plan names them."""
    W, dur = m["video"]["width"], m["video"]["duration_s"]
    items, notes, per_shot = [], [], []
    if plan is None:
        return {"ok": True, "ran": False, "items": [], "notes": ["no craft plan: finishing not checked"], "shots": []}
    scopes, _, notes = finish_scopes(plan, files, dur)
    named = {e: [s for s in m["shots"] if cover(s, scopes[e]) >= NAMED_SHARE] for e in FINISH_EFFECTS}
    unnamed = {e: [s for s in m["shots"] if cover(s, scopes[e]) == 0.0] for e in FINISH_EFFECTS}
    where = lambda s: f"{s['id']} ({s['start']:g}-{s['end']:g} s)"
    glow_present, glow_absent = max(GLOW_PRESENT_PX, GLOW_PRESENT * W), max(GLOW_ABSENT_PX, GLOW_ABSENT * W)
    for s in m["shots"]:
        f = s["finish"]
        per_shot.append({"id": s["id"], "start": s["start"], "end": s["end"], "grain": f["grain"], "vignette": f["vignette"],
                         "glow_px": f.get("glow_px"), "named": [e for e in FINISH_EFFECTS if s in named[e]]})
        g = f["grain"]
        if g is not None and s in named["grain"] and g <= GRAIN_FLOOR:
            items.append(f"grain is named on {where(s)} but measures {g:g} (not above the floor {GRAIN_FLOOR:g})")
        if g is not None and s in unnamed["grain"] and g >= GRAIN_PRESENT:
            items.append(f"grain {g:g} on {where(s)}, which neither the finish row nor shots.json names (an added grain "
                         f"measures {GRAIN_PRESENT:g} or more; name it with its source, or remove it)")
        gl = f.get("glow_px")
        if gl is not None and s in named["glow"] and gl < glow_absent:
            items.append(f"glow is named on {where(s)} but the brightest light text has a halo of {gl:g} px (under "
                         f"{glow_absent:.1f} px: sharp type reads about 1 px)")
        if gl is not None and s in unnamed["glow"] and gl >= glow_present:
            items.append(f"a glow of {gl:g} px around the brightest light text on {where(s)}, which neither the finish row "
                         f"nor shots.json names (a glow reads {glow_present:.1f} px or more)")
        if s in named["glow"] and gl is None:
            notes.append(f"glow is named on {where(s)} but no light text was measured there (pass --boxes)")
    vn = [s["finish"]["vignette"] for s in named["vignette"] if s["finish"]["vignette"] is not None]
    if vn and float(np.median(vn)) >= VIGNETTE_MAX:
        items.append(f"vignette is named on {len(vn)} shot(s) but their median corner over centre luma is "
                     f"{float(np.median(vn)):.3f} (a vignette sits under {VIGNETTE_MAX:g})")
    vu = [s for s in unnamed["vignette"] if s["finish"]["vignette"] is not None]
    dark = [s for s in vu if s["finish"]["vignette"] <= VIGNETTE_PRESENT]
    if len(dark) >= 2 and len(dark) * 2 >= len(vu):
        items.append(f"a vignette (corner over centre luma {VIGNETTE_PRESENT:g} or under) on {len(dark)} of {len(vu)} shots "
                     "that do not name it, whatever their content: " + ", ".join(where(s) for s in dark[:4]))
    elif len(dark) == 1:
        notes.append(f"{where(dark[0])} has darker corners ({dark[0]['finish']['vignette']:g}) and does not name a vignette; "
                     "one shot proves nothing (content or a vignette): the 09 critic looks")
    return {"ok": not items, "ran": True, "items": items, "notes": notes, "shots": per_shot}


def find_edl(files, given):
    if given:
        return read_json(given, "--edl file"), str(given)
    places = []
    if files.edit_plan_path:
        places += [files.edit_plan_path.parent / "edl.json", files.edit_plan_path.parent.parent / "edl.json"]
    if files.ice:
        places += [files.ice / "edit" / "edl.json", files.ice.parent / "edl.json"]
    for p in places:
        data = read_json_soft(p) if p.is_file() else None
        if isinstance(data, dict) and isinstance(data.get("ranges"), list):
            return data, str(p)
    return None, None


def class_ranges(files, edl):
    """[(a, b, class, grade)] in output seconds: edit plan scenes and shots.json shots with a "source_class", else
    the EDL ranges (times accumulated range by range, as render.py plays them)."""
    out = []
    for s in (files.edit_plan or {}).get("scenes") or []:
        if isinstance(s, dict) and s.get("source_class") and isinstance(s.get("start"), (int, float)) \
                and isinstance(s.get("end"), (int, float)):
            out.append((float(s["start"]), float(s["end"]), str(s["source_class"]), text_of(s.get("grade"))))
    for s in (files.shots or {}).get("shots") or []:
        if isinstance(s, dict) and s.get("source_class") and isinstance(s.get("start_s"), (int, float)) \
                and isinstance(s.get("end_s"), (int, float)):
            out.append((float(s["start_s"]), float(s["end_s"]), str(s["source_class"]), text_of(s.get("grade"))))
    if out or not isinstance(edl, dict):
        return out
    t, grades = 0.0, edl.get("grades") if isinstance(edl.get("grades"), dict) else {}
    for r in edl.get("ranges") or []:
        if not isinstance(r, dict) or not isinstance(r.get("start"), (int, float)) or not isinstance(r.get("end"), (int, float)):
            continue
        length = float(r["end"]) - float(r["start"])
        if length <= 0:
            continue
        cls = r.get("source_class")
        if cls:
            grade = r.get("grade") or grades.get(cls) or edl.get("grade") or ""
            out.append((t, t + length, str(cls), text_of(grade)))
        t += length
    return out


def class_looks(cls, grade):
    """The looks a class's grade asks for: a preset, look words in a raw grade, or "distinct" for an outside class
    with any other grade; empty for the film's own world."""
    g = grade.strip()
    if g in PRESET_LOOKS:
        return set(PRESET_LOOKS[g])
    named = {k for k, rx in LOOK_WORDS.items() if rx.search(g)}
    if named:
        return named
    if g.lower() not in OWN_GRADES and OUTSIDE_CLASS.search(cls):
        return {"distinct"}
    return set()


def check_grade(m, plan, files, edl, edl_from):
    """Every shot inside its planned look (source class grade or a look the finish row names), and the film's own
    world free of the outside treatment."""
    dur = m["video"]["duration_s"]
    classes = class_ranges(files, edl)
    _, looks, _ = finish_scopes(plan, files, dur) if plan else ({}, [], [])
    spans = [(a, b, class_looks(c, g), f"class {c}" + (f", grade {g}" if g else "")) for a, b, c, g in classes] + looks
    spans = [x for x in spans if x[2]]
    if not classes and not looks:
        return {"ok": True, "ran": False, "items": [], "notes": ["no source class (edit plan scenes, shots.json, --edl or "
                                                                   "an edl.json beside the edit plan) and no look in the "
                                                                   "finish row: the grade per source class is not checked"],
                "classes_from": None, "own": None, "shots": []}
    per, items, notes = [], [], []
    for s in m["shots"]:
        want, label = set(), []
        for a, b, lk, src in spans:
            if cover(s, [(a, b)]) >= NAMED_SHARE:
                want |= lk
                label.append(src)
        partly = any(0 < cover(s, [(a, b)]) < NAMED_SHARE for a, b, _, _ in spans)
        per.append({"id": s["id"], "start": s["start"], "end": s["end"], "looks": sorted(want), "from": label,
                    "partly": partly, "saturation": s["finish"]["saturation"], "lab_b": s["finish"]["lab_b"],
                    "black_point": s["finish"]["black_point"]})
    own = [p for p in per if not p["looks"] and not p["partly"] and p["saturation"] is not None]
    base = None
    if own:
        base = {"saturation": float(np.median([p["saturation"] for p in own])),
                "lab_b": float(np.median([p["lab_b"] for p in own])),
                "black_point": float(np.median([p["black_point"] for p in own])), "shots": len(own)}
    where = lambda p: f"{p['id']} ({p['start']:g}-{p['end']:g} s)"
    for p in per:
        if p["saturation"] is None:
            continue
        sat, bb, blk = p["saturation"], p["lab_b"], p["black_point"]
        for look in sorted(p["looks"]):
            if look != "mono" and base is None:
                notes.append(f"{where(p)}: {LOOK_TEXT[look]} needs the film's own world to compare with; none measured")
                continue
            ok = {"mono": lambda: sat <= 0.06,
                  "warm": lambda: bb >= base["lab_b"] + 5,
                  "desat": lambda: sat <= 0.65 * base["saturation"],
                  "lift": lambda: blk >= base["black_point"] + 10,
                  "distinct": lambda: sat <= 0.8 * base["saturation"] or abs(bb - base["lab_b"]) >= 4
                  or blk >= base["black_point"] + 10}[look]()
            if not ok:
                items.append(f"{where(p)} ({'; '.join(p['from'])}) is not inside its planned look, {LOOK_TEXT[look]}: "
                             f"saturation {sat:g}, b* {bb:g}, black point {blk:g}" +
                             (f" against the own world's {base['saturation']:.3f}, {base['lab_b']:.2f}, {base['black_point']:.1f}"
                              if base else ""))
        if not p["looks"] and not p["partly"] and base:
            if sat <= 0.04 and base["saturation"] >= 0.12:
                items.append(f"{where(p)} measures monochrome (saturation {sat:g}) but no source class or finish row names "
                             "a look there: the outside treatment reached the film's own world")
            elif sat <= 0.5 * base["saturation"] and blk >= base["black_point"] + 20:
                items.append(f"{where(p)} measures desaturated with lifted blacks (saturation {sat:g}, black point {blk:g}) "
                             "but no source class or finish row names a look there: the outside treatment reached the "
                             "film's own world")
    plan_classes = any(isinstance(s, dict) and s.get("source_class") for s in
                       ((files.edit_plan or {}).get("scenes") or []) + ((files.shots or {}).get("shots") or []))
    src = ("the edit plan or shots.json" if plan_classes else edl_from) if classes else None
    return {"ok": not items, "ran": True, "items": items, "notes": notes, "classes_from": src,
            "own": {k: round(v, 3) for k, v in base.items()} if base else None, "shots": per}


# ---------------------------------------------------------------- fixed marks
MARK_PAD = 0.06           # the slot widened by this share of the frame on every side
MARK_SCALES = tuple(round(0.80 + 0.05 * k, 2) for k in range(10))
MARK_SCORE = 0.5          # normalized correlation under this: the mark is not there
MARK_MAX_SAMPLES = 150


def mark_entries(files, plan, dur, project_root):
    """Fixed marks: shots.json "fixed_marks", else the identity row's "fixed_marks". -> ([mark dicts], problems)."""
    raw = (files.shots or {}).get("fixed_marks") if isinstance(files.shots, dict) else None
    src = "ice/plan/shots.json"
    if not raw:
        row = next((r for r in (plan or {}).get("rows") or [] if isinstance(r, dict) and r.get("dimension") == "identity"), None)
        raw, src = (row or {}).get("fixed_marks"), "the identity row of the craft plan"
    marks, problems = [], []
    for k, e in enumerate(raw or [], 1):
        label = f"mark {k}" + (f" ({e.get('mark')})" if isinstance(e, dict) and e.get("mark") else "")
        nums = {key: e.get(key) for key in ("x_pct", "y_pct", "w_pct")} if isinstance(e, dict) else {}
        if not nums or not all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in nums.values()) or not e["w_pct"] > 0:
            problems.append(f"{label} in {src} has no slot: write x_pct, y_pct and w_pct as numbers (measuring.md section 11)")
            continue
        def at(v, default, end):
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                return float(v)
            if v in (None, "", "start", "end", "film"):
                return default
            found, rng, _ = files.resolve(v, dur)
            if found and rng and math.isfinite(rng[1]):
                return float(rng[1] if end else rng[0])
            problems.append(f"{label}: \"{v}\" is not a time or a plan id with a time; the whole film is checked")
            return default
        a, b = at(e.get("from"), 0.0, False), at(e.get("to"), dur, True)
        file = next((e.get(key) for key in ("file", "image", "asset", "src") if e.get(key)), None)
        path = None
        if file:
            p = Path(str(file))
            for c in ([p] if p.is_absolute() else [project_root / p, project_root / "ice" / p]):
                if c.is_file():
                    path = c
                    break
            if path is None:
                problems.append(f"{label}: its file {file} is not found from {project_root}")
        h = e.get("h_pct") if isinstance(e.get("h_pct"), (int, float)) and not isinstance(e.get("h_pct"), bool) else None
        marks.append({"label": label, "x": nums["x_pct"] / 100, "y": nums["y_pct"] / 100, "w": nums["w_pct"] / 100,
                      "h": h / 100 if h else None, "from": a, "to": b, "file": str(path) if path else None, "src": src})
    return marks, problems


class MarkProbe:
    """Collects, on the detail samples inside each mark's range, the crop of the slot widened by MARK_PAD."""

    def __init__(self, marks, dur, detail_every):
        self.marks = marks
        for mk in marks:
            n = max(1, int((min(mk["to"], dur) - mk["from"]) / detail_every))
            mk["stride"] = max(1, math.ceil(n / MARK_MAX_SAMPLES))
            mk["crops"], mk["seen"] = [], 0

    def __call__(self, t, grey):
        H, W = grey.shape
        for mk in self.marks:
            if not mk["from"] - 1e-6 <= t <= mk["to"] + 1e-6:
                continue
            mk["seen"] += 1
            if (mk["seen"] - 1) % mk["stride"]:
                continue
            h = mk["h"] if mk["h"] else mk["w"] * W / H
            x0, y0 = int(max(0, (mk["x"] - MARK_PAD - 0.15 * mk["w"]) * W)), int(max(0, (mk["y"] - MARK_PAD - 0.15 * h) * H))
            x1 = int(min(W, (mk["x"] + 1.25 * mk["w"] + MARK_PAD) * W))
            y1 = int(min(H, (mk["y"] + 1.25 * h + MARK_PAD) * H))
            mk["window"] = (x0, y0, x1, y1, W, H)
            mk["crops"].append((t, grey[y0:y1, x0:x1].copy()))


def mark_template(mk):
    """(grey template, mask or None, how) at the planned size in detail px, or (None, None, why)."""
    x0, y0, x1, y1, W, H = mk["window"]
    tw = max(6, int(round(mk["w"] * W)))
    if mk["file"]:
        img = cv2.imread(mk["file"], cv2.IMREAD_UNCHANGED)
        if img is None:
            return None, None, f"cannot read its file {mk['file']}"
        mask = None
        if img.ndim == 3 and img.shape[2] == 4:
            mask = img[..., 3]
            img = img[..., :3]
        grey = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img
        th = max(6, int(round(tw * grey.shape[0] / grey.shape[1])))
        grey = cv2.resize(grey, (tw, th), interpolation=cv2.INTER_AREA)
        if mask is not None:
            mask = (cv2.resize(mask, (tw, th), interpolation=cv2.INTER_AREA) > 127).astype(np.uint8) * 255
            if mask.mean() < 0.05 * 255:
                return None, None, f"its file {mk['file']} is almost fully transparent"
            if mask.mean() > 254:
                mask = None
        return grey, mask, "its file"
    stack = np.stack([c for _, c in mk["crops"]]).astype(np.float32)
    med = np.median(stack, axis=0).astype(np.uint8)
    sx, sy = int(round(mk["x"] * W)) - x0, int(round(mk["y"] * H)) - y0
    if mk["h"]:
        th = max(6, int(round(mk["h"] * H)))
    else:                                  # the ink's height below the slot's top, inside its columns
        edges = cv2.Canny(med, 60, 150)[sy:sy + tw, sx:sx + tw]
        rows = np.where(edges.any(axis=1))[0]
        th = int(rows.max()) + 1 if len(rows) else 0
        if th < 6:
            return None, None, "the slot is flat on the frames of its range"
    tpl = med[sy:sy + th, sx:sx + tw]
    if tpl.shape[0] < 6 or tpl.shape[1] < 6:
        return None, None, "the slot falls outside the frame"
    if float(tpl.std()) < 10 or cv2.Canny(tpl, 60, 150).mean() / 255 < 0.02:
        return None, None, "the slot is flat on the frames of its range"
    return tpl, None, "the slot's median over its range (no file: position and size taken as planned)"


def match_mark(crop, tpl, mask, scales):
    best = (-1.0, 0, 0, 1.0)
    for s in scales:
        tw, th = int(round(tpl.shape[1] * s)), int(round(tpl.shape[0] * s))
        if tw < 6 or th < 6 or tw > crop.shape[1] or th > crop.shape[0]:
            continue
        t = cv2.resize(tpl, (tw, th), interpolation=cv2.INTER_AREA)
        if mask is not None:
            mk = cv2.resize(mask, (tw, th), interpolation=cv2.INTER_NEAREST)
            res = cv2.matchTemplate(crop, t, cv2.TM_CCOEFF_NORMED, mask=mk)
        else:
            if float(t.std()) < 1:
                continue
            res = cv2.matchTemplate(crop, t, cv2.TM_CCOEFF_NORMED)
        res = np.nan_to_num(res, nan=-1.0, posinf=-1.0, neginf=-1.0)
        _, mx, _, loc = cv2.minMaxLoc(res)
        if mx > best[0]:
            best = (float(mx), loc[0], loc[1], s)
    return best


def check_marks(marks, problems, step):
    """Each fixed mark found in its slot across its range (identity-tests.md section 8)."""
    items, out = list(problems), []
    for mk in marks:
        entry = {"mark": mk["label"], "from": mk["from"], "to": mk["to"], "template": None, "samples": len(mk.get("crops", [])),
                 "found": 0, "position_pct": None, "size_ratio": None, "drift_pct": None}
        out.append(entry)
        if not mk.get("crops"):
            items.append(f"{mk['label']}: no frame of the render falls in its range {mk['from']:g}-{mk['to']:g} s")
            continue
        tpl, mask, how = mark_template(mk)
        entry["template"] = how
        if tpl is None:
            items.append(f"{mk['label']} is missing from its slot (x {mk['x']:.1%}, y {mk['y']:.1%}, w {mk['w']:.1%}): {how}")
            continue
        x0, y0, _, _, W, H = mk["window"]
        scales = MARK_SCALES if mk["file"] else (1.0,)
        hits = [(t,) + match_mark(c, tpl, mask, scales) for t, c in mk["crops"]]
        found = [h for h in hits if h[1] >= MARK_SCORE]
        entry["found"] = len(found)
        run, runs = [], []
        for t, score, *_ in hits + [(None, 1.0)]:
            if score < MARK_SCORE:
                run.append(t)
            elif run:
                if len(run) >= 2:
                    runs.append((run[0], run[-1] + step))
                run = []
        if runs:
            items.append(f"{mk['label']} is missing from its slot " + ", ".join(f"{a:g}-{b:g} s" for a, b in runs[:5]) +
                         (" and more" if len(runs) > 5 else "") + " (its range: " + f"{mk['from']:g}-{mk['to']:g} s)")
        if not found:
            continue
        xs = np.array([(x0 + h[2]) / W for h in found])
        ys = np.array([(y0 + h[3]) / H for h in found])
        drift = max(float(np.percentile(xs, 90) - np.percentile(xs, 10)), float(np.percentile(ys, 90) - np.percentile(ys, 10)))
        entry["drift_pct"] = round(drift * 100, 2)
        if drift > 0.01:
            items.append(f"{mk['label']} moves by {drift:.1%} of the frame across its range: a fixed mark sits on the "
                         "screen layer and never rides the camera")
        if mk["file"]:
            px, py, sc = float(np.median(xs)), float(np.median(ys)), float(np.median([h[4] for h in found]))
            entry.update(position_pct=[round(px * 100, 2), round(py * 100, 2)], size_ratio=round(sc, 3))
            if abs(px - mk["x"]) > 0.02 or abs(py - mk["y"]) > 0.02:
                items.append(f"{mk['label']} sits at x {px:.1%}, y {py:.1%}; its slot is x {mk['x']:.1%}, y {mk['y']:.1%} "
                             "(more than 2 percent of the frame off)")
            if abs(sc - 1.0) > 0.10 + 1e-6:
                items.append(f"{mk['label']} measures {sc:.0%} of its planned width {mk['w']:.1%} (more than 10 percent off)")
    return {"ok": not items, "ran": bool(marks or problems), "items": items, "marks": out}


# ---------------------------------------------------------------- the speaker
SPEAKER_LED = re.compile(SPEAKER_TYPES.pattern + r"|presenter|talk[- ]?show|host", re.I)
SPEAKER_RUN = 2           # samples in a row before a speaker finding counts (0.4 s at 0.2 s)


def voice_spans(path):
    """[(start, end)] where a voice is active in the file's audio, or None when it has no audio. Energy in the speech
    band (250 to 3500 Hz, 32 ms windows every 20 ms) at least 12 dB over the file's quiet floor, with a syllable-rate
    swing of 8 dB or more inside 0.4 s; gaps under 0.3 s are bridged and bursts under 0.15 s dropped."""
    proc = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                          capture_output=True)
    x = np.frombuffer(proc.stdout, np.int16).astype(np.float32) / 32768.0
    if len(x) < 16000 * 0.2:
        return None
    win, hop = 512, 320
    n = 1 + (len(x) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    spec = np.abs(np.fft.rfft(x[idx] * np.hanning(win), axis=1)) ** 2
    band = spec[:, int(250 / 31.25):int(3500 / 31.25) + 1].sum(axis=1) / win
    e = 10 * np.log10(band + 1e-12)
    floor = float(np.percentile(e, 10))
    k = 10                                   # 0.4 s window either way: 20 frames
    pad = np.pad(e, k, mode="edge")
    view = np.lib.stride_tricks.sliding_window_view(pad, 2 * k + 1)
    swing = np.percentile(view, 90, axis=1) - np.percentile(view, 10, axis=1)
    active = (e >= max(floor + 12, -45.0)) & (swing >= 8)
    spans, start = [], None
    for i, v in enumerate(list(active) + [False]):
        t = i * hop / 16000
        if v and start is None:
            start = t
        elif not v and start is not None:
            spans.append([start, t + win / 16000])
            start = None
    merged = []
    for a, b in spans:
        if merged and a - merged[-1][1] < 0.3:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return [(round(a, 2), round(b, 2)) for a, b in merged if b - a >= 0.15]


class FaceProbe:
    """Mean luma, saturation and Laplacian variance of the inner box (15 percent in from each side) of every face on
    the detail samples, and of the last faces seen when none is found (a silhouette loses the cascades)."""

    def __init__(self):
        self.samples, self.last = [], []

    @staticmethod
    def stats(rgb, grey, box, scale):
        x, y, w, h = box[0] / scale[0], box[1] / scale[1], box[2] / scale[0], box[3] / scale[1]
        H, W = grey.shape
        x0, y0 = int(max(0, x + 0.15 * w)), int(max(0, y + 0.15 * h))
        x1, y1 = int(min(W, x + 0.85 * w)), int(min(H, y + 0.85 * h))
        if x1 - x0 < 4 or y1 - y0 < 4:
            return None
        g = grey[y0:y1, x0:x1]
        sat = cv2.cvtColor(np.ascontiguousarray(rgb[y0:y1, x0:x1]), cv2.COLOR_RGB2HSV)[..., 1]
        return {"luma": round(float(g.mean()), 2), "sat": round(float(sat.mean()) / 255, 4),
                "sharp": round(float(cv2.Laplacian(g, cv2.CV_32F).var()), 2)}

    def __call__(self, t, rgb, grey, faces, scale):
        if faces:
            self.last = [list(f) for f in faces]
            self.samples.append({"t": t, "held": False, "faces": [(list(f), self.stats(rgb, grey, f, scale)) for f in faces]})
        elif self.last:
            self.samples.append({"t": t, "held": True, "faces": [(f, self.stats(rgb, grey, f, scale)) for f in self.last]})
        else:
            self.samples.append({"t": t, "held": False, "faces": []})


def recede_windows(plan, files, dur):
    row = next((r for r in (plan or {}).get("rows") or [] if isinstance(r, dict) and r.get("dimension") == "cutout"), None)
    raw = (row or {}).get("recede_windows") or (row or {}).get("windows") or []
    out, notes = [], []
    for w in raw if isinstance(raw, list) else [raw]:
        if isinstance(w, dict) and isinstance(w.get("start"), (int, float)) and isinstance(w.get("end"), (int, float)):
            out.append((float(w["start"]), float(w["end"])))
            continue
        got, unplaced = ranges_of([w], files, dur)
        out += got
        if unplaced:
            notes.append(f"recede window {w!r} is not a time range or a plan id with a time")
    return sorted(out), notes


def check_speaker(probe, m, plan, files, route, subtype, voice, voice_from):
    """The speaker stays lit (the ice-edit skill, references/layers-and-isolation.md section 5)."""
    dur, step = m["video"]["duration_s"], m["settings"]["face_every_s"]
    windows, notes = recede_windows(plan, files, dur)
    kind = " ".join(text_of(v) for v in (subtype, (plan or {}).get("type")))
    res = {"ok": True, "ran": False, "items": [], "notes": notes, "windows": windows, "voice_from": voice_from,
           "voice_spans": (voice or [])[:60], "baseline": None}
    if not (SPEAKER_LED.search(kind) or windows):
        res["notes"].append("not a speaker-led type and no recede window: the speaker check does not apply")
        return res
    cuts = m["camera"]["cuts_s"]
    inside = lambda t: any(a - 1e-6 <= t <= b + 1e-6 for a, b in windows)
    largest = [max(s["faces"], key=lambda f: f[0][2] * f[0][3]) for s in probe.samples
               if s["faces"] and not s["held"] and not inside(s["t"])]
    if len(largest) < 3:
        res["notes"].append("no speaker face found on enough samples outside the recede windows (pass --faces with the "
                            "speaker's box)")
        return res
    ref = [float(np.median([f[0][k] for f in largest])) for k in range(4)]
    rcx, rcy = ref[0] + ref[2] / 2, ref[1] + ref[3] / 2

    def pick(faces):
        best = None
        for box, st in faces:
            d = math.hypot(box[0] + box[2] / 2 - rcx, box[1] + box[3] / 2 - rcy)
            if st and d <= 0.75 * ref[2] and 0.45 <= box[2] / ref[2] <= 1.6 and (best is None or d < best[0]):
                best = (d, box, st)
        return best
    track, held_since = [], None
    for s in probe.samples:
        if not s["held"]:
            held_since = s["t"]
        elif held_since is None or any(held_since < c <= s["t"] for c in cuts):
            continue                       # a held box never crosses a cut
        hit = pick(s["faces"])
        if hit:
            track.append({"t": s["t"], "held": s["held"], **hit[2]})
    out_w = [x for x in track if not inside(x["t"]) and not x["held"]]
    if len(out_w) < 3:
        res["notes"].append("the speaker's face is found on too few samples outside the recede windows")
        return res
    base = {k: float(np.median([x[k] for x in out_w])) for k in ("luma", "sat", "sharp")}
    res.update(ran=True, baseline={k: round(v, 3) for k, v in base.items()}, samples=len(track))
    if voice is None:
        res["notes"].append("no audio to read the voice from: every sample is taken as speaking (the stricter limits)")
    first_word = min((a for a, _ in voice or []), default=None)
    speaking = lambda t: voice is None or any(a - 0.1 <= t <= b + 0.1 for a, b in voice)
    news = bool(re.search(r"news", kind, re.I))
    findings = []
    for x in track:
        t, dim = x["t"], 1 - x["luma"] / max(base["luma"], 1e-6)
        desat = 1 - x["sat"] / base["sat"] if base["sat"] >= 0.03 else 0.0
        sharp = x["sharp"] / max(base["sharp"], 1e-6)
        kinds = []
        if base["luma"] >= 40 and x["luma"] <= 0.35 * base["luma"]:
            if not (news and first_word is not None and t < first_word and not inside(t)):
                kinds.append("a silhouette (luma at most 35 percent of the speaker's own)")
        elif inside(t) and speaking(t):
            if dim > 0.05:
                kinds.append("dimmed over 5 percent inside a recede window while speaking")
            if sharp < 0.5:
                kinds.append("defocused inside a recede window while speaking")
            if base["sat"] >= 0.03 and x["sat"] < 0.1 * base["sat"]:
                kinds.append("fully grey inside a recede window while speaking")
        elif inside(t):
            if dim > 0.15:
                kinds.append("dimmed over 15 percent inside a recede window while silent")
        else:
            if dim > 0.05:
                kinds.append("dimmed over 5 percent outside the recede windows")
            if desat > 0.15:
                kinds.append("desaturated over 15 percent outside the recede windows")
        for kd in kinds:
            findings.append((kd, t, dim, desat, sharp))
    for kd in dict.fromkeys(f[0] for f in findings):
        times = [f for f in findings if f[0] == kd]
        run, runs = [], []
        for f in times + [None]:
            if f is not None and run and f[1] - run[-1][1] <= step * 1.5:
                run.append(f)
                continue
            if len(run) >= SPEAKER_RUN:
                runs.append(run)
            run = [f] if f is not None else []
        for r in runs[:4]:
            worst = max(r, key=lambda f: f[2])
            res["items"].append(f"the speaker is {kd} from {r[0][1]:g} to {r[-1][1] + step:g} s (at worst: luma "
                                f"{-worst[2]:+.0%}, saturation {-worst[3]:+.0%}, sharpness x{worst[4]:.2f}, against the "
                                "speaker's median outside the windows)")
    res["ok"] = not res["items"]
    return res


def run_build(args):
    load_cv()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise Unreadable("ffmpeg and ffprobe are required on PATH")
    project, render = Path(args.project), Path(args.render)
    if not project.exists():
        raise Unreadable(f"project not found: {project}")
    if not render.is_file():
        raise Unreadable(f"render not found: {render}")
    ice = find_ice(project)
    plan, plan_path = load_plan(ice) if ice else (None, None)
    plan = plan if isinstance(plan, dict) else None
    state = (read_json_soft(ice / "state.json") or {}) if ice else {}
    state = state if isinstance(state, dict) else {}
    boxes = read_box_file(args.boxes, "boxes") if args.boxes else None
    faces = read_box_file(args.faces, "faces") if args.faces else None
    lint = read_json(args.lint, "--lint file") if args.lint else None
    files = PlanFiles(ice)
    edl, edl_from = find_edl(files, args.edl)
    root = ice.parent if ice else (project if project.is_dir() else project.parent)
    try:
        W, H, vdur, _ = probe(render)
        marks, mark_problems = mark_entries(files, plan, vdur or files.duration or 0.0, root)
        face_probe, mark_probe = FaceProbe(), MarkProbe(marks, vdur or 0.0, FACE_DETECT_EVERY)
        def hook(t, rgb, grey, fcs, scale):
            face_probe(t, rgb, grey, fcs, scale)
            mark_probe(t, grey)
        m = measure(render, want_text=boxes is None, face_lookup=box_lookup(faces, W, H) if faces is not None else None,
                    declared_cuts=files.declared_cuts(), text_lookup=box_lookup(boxes, W, H) if boxes is not None else None,
                    probe_hook=hook)
        voice_file = Path(args.voice) if args.voice else render
        if args.voice and not voice_file.is_file():
            raise Unreadable(f"--voice file not found: {voice_file}")
        voice = voice_spans(voice_file)
    except (subprocess.CalledProcessError, RuntimeError, ValueError, KeyError, OSError) as e:
        raise Unreadable(f"cannot read this video: {render} ({e})")
    if boxes is not None:
        m["boxes_from"] = "--boxes"
        boxes_at = box_lookup(boxes, W, H)
        moved = box_changes([(s["t"], s["boxes"], s["width"], s["height"]) for s in boxes], W, H)
        moved_from = f"--boxes {args.boxes}"
    else:
        by_t = {d["t"]: d.get("text_boxes") or [] for d in m["detail"]}
        boxes_at = lambda t: by_t.get(t, [])
        moved = box_changes([(d["t"], d.get("text_boxes") or [], W, H) for d in m["detail"]], W, H)
        moved_from = "the text-region detector"
    events, events_from = declared_events(files, render)
    changes = sorted(set(events) | set(moved))
    change_from = events_from + ([f"text or card boxes in or out ({len(moved)}, {moved_from})"] if moved else [])
    rows = {str(r.get("dimension")): r for r in (plan or {}).get("rows") or [] if isinstance(r, dict)}
    route, subtype = state.get("route"), state.get("subtype")
    checks = {"faces": check_faces(m, boxes_at, W, H), "flashes": check_flashes(m, plan, files),
              "camera": check_camera(m, rows, route, subtype, plan, changes, change_from, reference_idle(ice, plan)),
              "finishing": check_finishing(m, plan, files),
              "grade": check_grade(m, plan, files, edl, edl_from),
              "marks": check_marks(marks, mark_problems, m["settings"]["face_every_s"]),
              "speaker": check_speaker(face_probe, m, plan, files, route, subtype, voice,
                                       f"--voice {args.voice}" if args.voice else "the render's audio")}
    evidence = check_evidence(plan, m, files, lint, boxes is not None and any(s["boxes"] for s in boxes))
    depth_path, depth_why = write_depth_file(m, render.with_suffix(".depth.json"))
    reds = []
    if plan is None:
        reds.append("craft plan: ice/plan/craft-plan.json is missing or unreadable, so no use row can be checked "
                    "(run craft_gate.py plan first)")
    for name in ("faces", "flashes", "camera", "finishing", "grade", "marks", "speaker"):
        reds += [f"{name}: {x}" for x in checks[name]["items"]]
    reds += [f"evidence {e['dimension']}: {e['evidence']}" for e in evidence if not e["ok"]]
    depth = {k: m["depth"][k] for k in DEPTH_KEYS + ("moving_pairs", "pairs", "screen_share", "shots")}
    report = {"tool": "craft_gate.py build", "version": VERSION, "render": str(render), "plan": str(plan_path) if plan_path else None,
              "route": route, "subtype": subtype, "video": m["video"], "summary": m["summary"], "checks": checks,
              "evidence": evidence, "depth": depth, "depth_file": depth_path, "depth_file_error": depth_why,
              "shots": [{k: s[k] for k in ("id", "start", "end", "moving_share", "longest_idle_s", "finish", "focus_ratio",
                                           "layers", "parallax_ratio", "push_through")}
                        for s in m["shots"]],
              "moves": m["camera"]["moves"], "reds": reds, "verdict": "red" if reds else "pass"}
    out_dir = (ice if ice else project / "ice") / "review"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "craft-gate.json").write_text(json.dumps(report, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    report["written"] = str(out_dir / "craft-gate.json")
    return report


def build_lines(r):
    v = r["video"]
    L = [f"craft_gate.py build: {r['render']} ({v['width']}x{v['height']}, {v['duration_s']} s); plan {r['plan'] or 'missing'}"]
    c = r["checks"]
    def light(ok):
        return "[PASS]" if ok else "[RED] "
    f = c["faces"]
    L.append(f"  {light(f['ok'])} faces: " + ("no text over a face" if f["ok"] else "text over a face") +
             f" (faces from {f['faces_from']}" + ("" if f["faces_found"] else ", none found") + f"; boxes from {f['boxes_from']})")
    L += [f"         - {x}" for x in f["items"]]
    fl = c["flashes"]
    L.append(f"  {light(fl['ok'])} flashes: max {fl['max_per_s']} in any 1 s window (safe mode: at most {FLASH_LIMIT}); "
             f"{fl['first_3s_flashes']} in the first 3 s")
    L += [f"         - {x}" for x in fl["items"]]
    L += [f"         warning: {x}" for x in fl["warnings"]]
    cam = c["camera"]
    limit = f"limit {cam['limit_s']:g} s from {cam['limit_from']}" if cam["limit_s"] is not None else "no limit for this plan and type"
    L.append(f"  {light(cam['ok'])} camera: takes over {TAKE_MIN_S:g} s: {cam['takes_over_8s']}, longest idle "
             f"{cam['longest_idle_s']} s ({limit}); idle runs end at camera moves, cuts"
             + (", " + ", ".join(cam["changes_from"]) if cam.get("changes_from") else ""))
    L += [f"         - {x}" for x in cam["items"]]
    fin = c["finishing"]
    L.append(f"  {light(fin['ok'])} finishing: grain, glow and vignette per shot against the finish row and shots.json"
             + ("" if fin["ran"] else " (not checked)"))
    L += [f"         - {x}" for x in fin["items"]] + [f"         note: {x}" for x in fin["notes"]]
    gr = c["grade"]
    L.append(f"  {light(gr['ok'])} grade per source class: " + (f"classes from {gr['classes_from']}" if gr["classes_from"]
                                                                 else "looks from the finish row" if gr["ran"] else "not checked")
             + (f"; own world saturation {gr['own']['saturation']}, b* {gr['own']['lab_b']}, black {gr['own']['black_point']}"
                if gr.get("own") else ""))
    L += [f"         - {x}" for x in gr["items"]] + [f"         note: {x}" for x in gr["notes"]]
    mk = c["marks"]
    L.append(f"  {light(mk['ok'])} fixed marks: " + (", ".join(f"{x['mark']} found on {x['found']} of {x['samples']} "
                                                               f"samples ({x['template']})" for x in mk["marks"])
                                                    if mk["marks"] else "none planned"))
    L += [f"         - {x}" for x in mk["items"]]
    sp = c["speaker"]
    L.append(f"  {light(sp['ok'])} speaker: " + (f"baseline luma {sp['baseline']['luma']:g}, saturation "
                                                 f"{sp['baseline']['sat']:g}; {len(sp['windows'])} recede window(s); "
                                                 f"{len(sp['voice_spans'])} voice span(s) from {sp['voice_from']}"
                                                 if sp["ran"] else "not checked"))
    L += [f"         - {x}" for x in sp["items"]] + [f"         note: {x}" for x in sp["notes"]]
    d = r["depth"]
    L.append(f"  depth from pixels: layers {d['layers']}, parallax ratio {d['parallax_ratio']}, push-throughs "
             f"{d['push_through']}, camera moving share {d['camera_moving_share']}; "
             + (f"written to {r['depth_file']} (the depth gate of motion_check.py reads it)" if r["depth_file"]
                else f"not written ({r['depth_file_error']})"))
    if r["evidence"]:
        L.append("  Evidence of every use row:")
        L += [f"  {light(e['ok'])} {e['dimension']}: {e['evidence']}" for e in r["evidence"]]
    L.append(f"  Written: {r['written']}")
    L.append("Verdict: RED. Fix what is listed, render again and rerun this check." if r["verdict"] == "red"
             else "Verdict: PASS. The 09 critic still reads every use row against the frames.")
    return L


# ---------------------------------------------------------------- command line
class Parser(argparse.ArgumentParser):
    """A usage error exits 1 (unreadable input), so exit 2 always means a red."""

    def error(self, message):
        self.print_usage(sys.stderr)
        print(f"craft_gate.py: {message}", file=sys.stderr)
        sys.exit(1)


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    ap = Parser(prog="craft_gate.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("plan", help="check ice/plan/craft-plan.json (standard library only)")
    p.add_argument("project")
    p.add_argument("--json", action="store_true")
    p = sub.add_parser("measure", help="pixel measures of any video, written as JSON")
    p.add_argument("video")
    p.add_argument("--out", required=True, help="JSON file to write")
    p.add_argument("--every", type=float, default=0.1, help="camera sample interval in seconds (default 0.1)")
    p.add_argument("--width", type=int, default=320, help="camera analysis width in px (default 320)")
    p.add_argument("--depth-out", help="the depth file to write (default: <video>.depth.json beside the video; for a "
                                       "reference: ice/reference/<ref-id>/analysis/depth.json)")
    p.add_argument("--text", action="store_true", help="detect text boxes, so the glow radius around light text is measured")
    p = sub.add_parser("build", help="check the render against the craft plan; writes ice/review/craft-gate.json")
    p.add_argument("project")
    p.add_argument("--render", required=True, help="the rendered video")
    p.add_argument("--boxes", help="text and card boxes per sample (lint.mjs --boxes-out)")
    p.add_argument("--faces", help="face boxes per sample; replaces face detection")
    p.add_argument("--lint", help="lint.mjs --json output with craft_marks (HTML builds)")
    p.add_argument("--edl", help="the edit's EDL (render.py format) for the grade per source class")
    p.add_argument("--voice", help="an audio or video file whose audio is the voice alone (the voice stem), for the "
                                   "speaker check; default: the render's own audio")
    p.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    try:
        if a.cmd == "plan":
            res = check_plan(a.project)
            print(json.dumps(res, ensure_ascii=False, indent=1) if a.json else "\n".join(plan_report(res)))
            return 2 if res["verdict"] == "red" else 0
        if a.cmd == "measure":
            load_cv()
            if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
                raise Unreadable("ffmpeg and ffprobe are required on PATH")
            if not 0.02 <= a.every <= 2.0:
                raise Unreadable("--every must be between 0.02 and 2 seconds")
            try:
                m = measure(Path(a.video), every=a.every, width=max(64, a.width), want_text=a.text)
            except (subprocess.CalledProcessError, RuntimeError, ValueError, KeyError, OSError) as e:
                raise Unreadable(f"cannot read this video: {a.video} ({e})")
            out = Path(a.out)
            out.parent.mkdir(parents=True, exist_ok=True)
            depth_path, why = write_depth_file(m, a.depth_out or Path(a.video).with_suffix(".depth.json"))
            m["depth_file"] = depth_path
            out.write_text(json.dumps(m, ensure_ascii=False) + "\n", encoding="utf-8")
            print("\n".join(measure_lines(m) + [f"  written: {out}"] +
                            [f"  depth file: {depth_path}" if depth_path else f"  depth file not written: {why}"]))
            return 0
        r = run_build(a)
        print(json.dumps(r, ensure_ascii=False, indent=1) if a.json else "\n".join(build_lines(r)))
        return 2 if r["verdict"] == "red" else 0
    except Unreadable as e:
        print(f"craft_gate.py: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
