#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
# Adapted from alchaincyf/huashu-art-motion (MIT), scripts/storyboard_lint.py. Changes: ported from a Chinese shot
# table to an English one (column names, style-lock lines, word lists for layout nouns, weak verbs, camera words and
# character words rewritten in English); script numbers are read as digits (Western, Arabic-Indic and Persian) and as
# English number words instead of Chinese numerals; huashu palette names and clip grammar ids replaced by hex values,
# a DIRECTION.md reference and "template:<name>" method tags; the storytime-grammar rule (y4) dropped; a "Style
# exception:" lock line downgrades the mixed-method rule to yellow; messages in English; dash characters replaced.
# Check logic, thresholds and exit codes unchanged, except (2026-10-19, after the pilot films): text units are counted
# with combining marks removed (an Arabic word with a shadda is one unit); the Object column is text-led only when a text
# noun heads the phrase; rows tagged `CTA block` get a larger text cap scoped by film type; the palette limit counts hue
# families, not tonal steps; the film type is read from --type or the project (scoped values: motion-density.md
# section 6). This file also holds the film type helpers that look.py, film_gate.py and motion_check.py import.
# See NOTICE.md.
"""storyboard_lint.py: check a shot table mechanically before any code is written.

Usage:
  python storyboard_lint.py STORYBOARD.md [--script script.txt] [--type "film type"]

The film type comes from --type, else ice/state.json "subtype", else the film_type row of ice/BRIEF.md (found by walking
up from the storyboard and the working folder); it picks the scoped values in references/motion-density.md section 6 and
is printed on the first line.

Lock the look above the table (lines outside the table, written before it):
  Style: one sentence (one style card or one drawing method, used for the whole film)
  Palette: hex values with roles (3-6 hue families; light and shadow steps of a hue allowed), or "see ice/DIRECTION.md"
           plus the hex values
  Characters: none / hands and backs only / frame library <path> / rig <path>
  Allow blue-purple: <reason>          (optional, only when the user asked for blue or purple)
  Style exception: <reason>            (optional, only for a scoped style change, see the ice-styles skill)
Then a markdown table, one row per shot, columns:
  Time | Object | Action | Camera | On-screen text | Trigger | Reason | Method (optional, recommended) | Tags (optional)
Tables inside code fences are skipped. With several tables only the first one with "Object" and "Action" columns is checked.

Per row:
  (1) Object: not empty, not only a layout word (title, bullet, text, list, label, caption, card, background, frame,
      icon...), and not an empty picture (blank, flat colour, black screen, gradient ground)                 -> red
  (2) Action: not empty and not only a generic verb (appears, shows, displays, fades in...)                  -> red
  (3) On-screen text <= 8 units (a CJK character counts one; a word or number in any other script counts one; combining
      marks such as Arabic harakat and shadda are removed first)                                             -> red
      A required label written as [label: <exact text>] (ice-assets truth-sheet.md section 9) is not counted.
      Scoped exception: end-card rows tagged `CTA block` in the Tags column, in a type whose cta_info_units is above
      0 (motion-density.md section 6), may carry the facts a viewer needs to act (name, date, time, place, store line,
      link) up to 8 + cta_info_units units; over it -> red.
  (4) The first shot is not text-led (a text noun heads the Object phrase, or text >= 7 units outside a CTA block
      row, or method is kinetic type)                                                                          -> red
  (6) Shot 2-6 s; 6-8 s or under 2 s -> yellow; over 8 s -> red; more than a fifth of shots at 6-8 s -> red
  (7) Three shots in a row with the same Camera value ("hold" and "glide" excepted)                          -> yellow
  (15) Three shots in a row all pushing in (slow push, fast push, push in, slam, zoom in, punch in)          -> yellow
  (8) The last shot is not text-led (centred quote card, pure text card; same test as 4)                    -> red
  (11) A middle shot that is a text-led number card                                                         -> yellow
  (9) With --script: a number on screen (percent, year, number with unit) that the script never says        -> red
      (the script may say it as digits or as English words: "sixty percent" = 60%, "fifteen point two" = 15.2)
  (10) With a Tags column: more than 3 tags in one shot                                                     -> yellow
  (17) Trigger and Reason (owner decision, 2026-10-29): every row names its trigger (the script sentence or word that
       justifies it, with its time; for a film without speech, the music or sound cue or the story event) and its
       reason (what the element means, who or what it is on, why its colour and shape). An empty or filler cell
       ("reference", "style", "decoration", "looks good", "as in the reference") -> red: cut the element or write both.
       A table with no Trigger or no Reason column -> red. Rule: references/storyboard-lint.md section 3b.
Whole table:
  (5) Text-led shots <= 30% of shots                                                                        -> red
  Method column (when present): one reusable template or clip file (.json/.html) running over 8 s in total -> red;
      more than 2 template families ("template:<name>") mixed in one film -> red (yellow with "Style exception:")
  (12) Style lock: "Style", "Palette" or "Characters" line missing                                         -> red
  (13) Palette: a hex value in the blue-purple zone (hue 225-300 deg, saturation >= 0.30) -> red (yellow with
       "Allow blue-purple:"); more than 6 hue families -> yellow (hues within 30 deg are one family, so light and
       shadow tones of one hue count once; near-greys are one neutral family)
  (14) Characters: code-drawn people, chibi figures, robots or stick figures without a frame library or rig -> red;
       such a figure in the Object column without one -> red; faces on coins, balls, ions -> yellow
  (16) Accent moves (fast push, slam, whip) on more than a third of shots                                   -> yellow
  Time spans that do not join, or a table with no camera move at all (only hold and cut)                    -> yellow

Exit codes: 1 with any red; 0 with only yellow or all green; 2 when the file cannot be read or has no table.
Standard library only.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

RED, YELLOW, GREEN = "RED", "YELLOW", "GREEN"

# ---------------------------------------------------------------- film type and scoped values (shared)
# look.py, film_gate.py and motion_check.py import these helpers from this file; lint.mjs has a Node copy.
# ice-qa's own scoped values (end holds, CTA block text allowance) live in references/motion-density.md section 6. The
# richness floor numbers are never copied here: they are read per film type from their owners, the ice-film type files
# ("Richness floor" table) and, for explainers, the ice-motion skill (composition-and-staging.md section 7.3).
SCOPE_FILE = Path(__file__).resolve().parent.parent / "references" / "motion-density.md"
FILM_TYPES_DIR = Path(__file__).resolve().parent.parent.parent / "ice-film" / "references" / "film-types"
STAGING_FILE = Path(__file__).resolve().parent.parent.parent / "ice-motion" / "references" / "composition-and-staging.md"
RICH_KEYS = ("hero_share", "frame_fill", "empty_half", "in_shot_motion", "longest_still", "depth_layers")


def _cells(line):
    s = line.strip()
    if s.startswith("|"): s = s[1:]
    if s.endswith("|"): s = s[:-1]
    return [c.strip() for c in s.split("|")]


def _table_after(lines, start):
    """First markdown table at or after line index start: (header cells, [row cells])."""
    i = start
    while i < len(lines) and not (lines[i].strip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|?\s*:?-{2,}", lines[i + 1])):
        i += 1
    if i >= len(lines): return None, []
    head, rows, j = _cells(lines[i]), [], i + 2
    while j < len(lines) and lines[j].strip().startswith("|"):
        rows.append(_cells(lines[j])); j += 1
    return head, rows


def _key(cell):
    m = re.search(r"`([a-z_]+)`", cell)
    return m.group(1) if m else re.sub(r"[^a-z_ ]", "", cell.lower()).strip()


def scope_table(path=SCOPE_FILE):
    """{row name: {column key: raw cell}} from motion-density.md section 6. Each name of a row ("a / b") is a key."""
    lines = Path(path).read_text(encoding="utf-8").splitlines()
    at = next((k for k, ln in enumerate(lines) if re.match(r"^##\s*6\.", ln)), None)
    if at is None: raise ValueError(f"{path}: section 6 (scoped gate values) not found")
    head, rows = _table_after(lines, at)
    keys = [_key(h) for h in head]
    out = {}
    for r in rows:
        vals = {keys[k]: (r[k] if k < len(r) else "-") for k in range(1, len(keys))}
        for name in r[0].split("/"):
            out[name.strip().lower()] = dict(vals, row=r[0].strip())
    return out


def _norm(t):
    return re.sub(r"[\W_]+", " ", (t or "").lower()).strip()


def find_type_text(*starts):
    """Film type text from ice/state.json (subtype) or ice/BRIEF.md (film_type row), walking up from each start path.
    Returns (text, source) or (None, None)."""
    seen = set()
    for st in starts:
        if not st: continue
        p = Path(st).resolve()
        for d in [p] + list(p.parents):
            for ice in ([d] if d.name == "ice" else []) + [d / "ice"]:
                if ice in seen or not ice.is_dir(): continue
                seen.add(ice)
                sj = ice / "state.json"
                if sj.is_file():
                    try:
                        sub = json.loads(sj.read_text(encoding="utf-8")).get("subtype")
                        if sub: return str(sub), str(sj)
                    except (OSError, ValueError):
                        pass
                bm = ice / "BRIEF.md"
                if bm.is_file():
                    for ln in bm.read_text(encoding="utf-8", errors="replace").splitlines():
                        c = _cells(ln) if ln.strip().startswith("|") else []
                        if len(c) >= 2 and _norm(c[0].strip("`*")) == "film type" and c[1].strip():
                            return c[1].strip(), str(bm)
    return None, None


def num(cell):
    """A table cell -> float, or None for '-', 'n/a', 'reading' and empty."""
    m = re.search(r"-?\d+(?:\.\d+)?", cell or "")
    return None if not m or (cell or "").strip().lower() in ("-", "n/a", "na") else float(m.group(0))


ORIENT = {"vertical": re.compile(r"\bvertical\b|9\s*:\s*16|portrait", re.I),
          "landscape": re.compile(r"16\s*:\s*9|landscape|horizontal|\bsquare\b|1\s*:\s*1", re.I)}


def parse_floor(cell, orientation):
    """One prose cell of an ice-film "Richness floor" table -> (lowest, highest, kept clauses) or None.
    Clauses are split on ';'. A clause naming the other orientation is skipped (16:9, square, landscape vs vertical,
    9:16). Parentheses are notes and are removed after the orientation test, and so are '<n> of 16' denominators,
    'per <n> s' rates and aspect ratios. Every number left in the kept clauses is a threshold; several numbers
    (energetic and calm spots, feature and everyday shots) give a lenient one (red) and a strict one (yellow): for a
    floor red is under the lowest and yellow under the highest; for a ceiling red is over the highest and yellow over the
    lowest. 'n/a' or no number -> None."""
    raw = (cell or "").strip()
    if not raw or raw.lower().startswith(("n/a", "-")): return None
    nums, kept = [], []
    for cl in raw.split(";"):
        other = "landscape" if orientation == "vertical" else "vertical"
        if ORIENT[other].search(cl) and not ORIENT[orientation].search(cl): continue
        c = re.sub(r"\([^)]*\)", " ", cl)
        c = re.sub(r"\d+\s*:\s*\d+|\bof\s+16\b|\bper\s+\d+(?:\.\d+)?\s*s\b", " ", c)
        found = [float(x) for x in re.findall(r"(?<![\w.])\d+(?:\.\d+)?", c)]
        if found: nums += found; kept.append(cl.strip())
    return (min(nums), max(nums), "; ".join(kept)) if nums else None


def owner_floor(row_name, orientation):
    """Richness floor for a film type, read from the owner: the ice-film type file's "Richness floor" table (measures as
    rows, the number in the second cell), or for explainers the defaults in the ice-motion skill,
    references/composition-and-staging.md section 7.3. -> ({measure: (lenient, strict, clause)}, source path, notes)."""
    name = row_name.split("/")[0].strip().lower()
    f = FILM_TYPES_DIR / (name.replace(" ", "-") + ".md")
    out, notes = {}, []
    if f.is_file():
        lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
        at = next((k for k, ln in enumerate(lines) if ln.lstrip().startswith("#") and "richness floor" in ln.lower()), None)
        head, rows = _table_after(lines, at) if at is not None else (None, [])
        for r in rows:
            k = _key(r[0])
            if k in RICH_KEYS and len(r) > 1:
                v = parse_floor(r[1], orientation)
                if v: out[k] = v
                elif not r[1].strip().lower().startswith(("n/a", "-")):
                    notes.append(f"{k}: {r[1]!r} has no number this script can gate on; judge it by eye")
        return out, (str(f) if rows else None), notes
    if name == "explainer" and STAGING_FILE.is_file():
        txt = STAGING_FILE.read_text(encoding="utf-8", errors="replace")
        line = next((ln for ln in txt.splitlines() if "explainers use" in ln.lower()), "")
        for k in RICH_KEYS:
            m = re.search(r"`" + k + r"`\s*(\d+(?:\.\d+)?)", line)
            if m: out[k] = (float(m.group(1)), float(m.group(1)), m.group(0))
        return out, (str(STAGING_FILE) if out else None), notes
    return {}, None, notes


def resolve_scope(type_arg=None, starts=()):
    """-> dict(type_text, type_source, row, values{key: raw cell}, notes[]). type_arg wins over the project files.
    The richness floor is read separately with owner_floor(scope['row'], orientation) once the frame size is known."""
    table = scope_table()
    text, src = (type_arg, "--type") if type_arg else find_type_text(*starts)
    notes, row = [], None
    if text:
        t = " " + _norm(text) + " "
        hits = [(t.find(" " + _norm(n) + " "), -len(n), n) for n in table if n != "default" and (" " + _norm(n) + " ") in t]
        if hits: row = min(hits)[2]
    if row is None:
        notes.append(f"film type {text!r} matches no row in motion-density.md section 6: using the default row" if text
                     else "no film type found (pass --type, or run inside a project with ice/state.json): using the default row")
        row = "default"
    vals = dict(table[row])
    return {"type_text": text, "type_source": src, "row": vals["row"], "values": vals, "notes": notes}


def project_ice(*starts):
    """The project's ice/ folder found by walking up from the start paths, or None."""
    for st in starts:
        if not st: continue
        p = Path(st).resolve()
        for d in [p] + list(p.parents):
            for ice in ([d] if d.name == "ice" else []) + [d / "ice"]:
                if (ice / "state.json").is_file() or (ice / "plan").is_dir(): return ice
    return None


def declared_times(ice, events_path=None):
    """Declared holds and the CTA start, from ice/plan/cue-sheet.json (the `quiet` list; an event whose kind is "cta" or
    whose text names the CTA) and from an events file (type "hold" with t and end; type "show" or "cta" labelled cta).
    -> (holds [(start, end, reason)], cta_start or None, sources [])."""
    holds, cta, src = [], None, []
    def cta_ev(e):
        blob = " ".join(str(e.get(k, "")) for k in ("kind", "type", "label", "what", "name"))
        return re.search(r"\bcta\b|call to action|end ?card", blob, re.I) is not None
    cs = ice / "plan" / "cue-sheet.json" if ice else None
    if cs and cs.is_file():
        try:
            c = json.loads(cs.read_text(encoding="utf-8"))
            for q in c.get("quiet") or []:
                if isinstance(q, dict) and isinstance(q.get("start"), (int, float)) and isinstance(q.get("end"), (int, float)):
                    holds.append((float(q["start"]), float(q["end"]), str(q.get("reason", "quiet"))))
            ts = [float(e["t"]) for e in c.get("events") or [] if isinstance(e, dict) and isinstance(e.get("t"), (int, float)) and cta_ev(e)]
            if ts: cta = min(ts)
            src.append(str(cs))
        except (OSError, ValueError):
            pass
    if events_path and Path(events_path).is_file():
        try:
            ev = json.loads(Path(events_path).read_text(encoding="utf-8"))
            ev = ev.get("events", []) if isinstance(ev, dict) else ev
            for e in ev if isinstance(ev, list) else []:
                if not isinstance(e, dict) or not isinstance(e.get("t"), (int, float)): continue
                ty = str(e.get("type", "")).lower()
                if ty == "hold" and isinstance(e.get("end"), (int, float)):
                    holds.append((float(e["t"]), float(e["end"]), str(e.get("label", "hold"))))
                elif ty in ("show", "cta") and cta_ev(e):
                    cta = float(e["t"]) if cta is None else min(cta, float(e["t"]))
            src.append(str(events_path))
        except (OSError, ValueError):
            pass
    return sorted(holds), cta, src


def cta_block_text(ice):
    """On-screen text of the storyboard rows tagged `CTA block` (or the last row when none is tagged): (text, tagged)."""
    sb = ice / "plan" / "storyboard.md" if ice else None
    if not sb or not sb.is_file(): return None, False
    head, raw = find_table(sb.read_text(encoding="utf-8", errors="replace"))
    if head is None or not raw: return None, False
    col = columns(head)
    get = lambda cells, k: cells[col[k]] if k in col and col[k] < len(cells) else ""
    tagged = [c for _, c in raw if is_cta_block(get(c, "tags") + " " + get(c, "role"))]
    rows = tagged or [raw[-1][1]]
    return " ".join(clean_cell(get(c, "text")) for c in rows), bool(tagged)


def is_cta_block(cell):
    return re.search(r"\bcta block\b|\bend ?card\b", cell or "", re.I) is not None


# A required on-screen label (the "Example data" or unofficial-concept line of ice-assets truth-sheet.md section 9) is
# written in the On-screen text cell as [label: <exact text>]; checks (3) and (4) do not count it as copy.
REQUIRED_LABEL = re.compile(r"\[\s*label\s*:[^\]]*\]", re.I)


def without_required_labels(cell):
    return REQUIRED_LABEL.sub(" ", cell or "")


def reading_time(text):
    """Reading time of display text with no voice (ice-type reading-time sections 1 and 3)."""
    t = strip_marks(clean_cell(text))
    cjk = len(re.findall(r"[㐀-鿿぀-ヿ가-힯]", t))
    letters = len(re.findall(r"[^\W_]", t)) - cjk
    return round(letters / 15 + cjk / 4.5 + 1.5, 2)


def strip_marks(t):
    """Remove combining marks (Arabic harakat and shadda, other scripts' vowel signs) and format characters (ZWJ, ZWNJ,
    bidi marks), so a word with diacritics stays one word."""
    return "".join(ch for ch in unicodedata.normalize("NFC", t) if unicodedata.category(ch) not in ("Mn", "Mc", "Me", "Cf"))

# (1) Object: when these words, counts, positions, colours and punctuation are removed and nothing is left, no object
# was written.
ABSTRACT = sorted("""title titles subtitle subtitles heading headings headline headlines bullet bullets point points
key-points text texts big-text type word words list lists checklist label labels caption captions subtitle-bar card cards
text-card background backgrounds ground backdrop frame frames screen picture image images photo icon icons slide slides
keyword keywords quote quotes tagline taglines slogan slogans summary conclusion concept concepts content information
element elements thing things diagram diagrams chart-junk illustration page pages layout animation animations effect
effects copy paragraph paragraphs sentence sentences dot dots symbol symbols number-label arrow arrows line lines shape
shapes box boxes block blocks gradient gradients light-spot bokeh particle particles decoration decorations ui-card
placeholder whiteboard blackboard""".split(), key=len, reverse=True)
FILLER = re.compile(r"\b(?:a|an|the|of|and|with|or|on|in|at|to|from|for|some|several|many|few|one|two|three|four|five|"
                    r"six|seven|eight|nine|ten|big|small|large|tiny|new|left|right|top|bottom|center|centre|middle|"
                    r"white|black|red|blue|green|yellow|grey|gray|orange|purple|pink|dark|light|empty|blank|flat|"
                    r"solid|plain|main|key|another|other|each|every|row|column|set|stack|pile|group)\b"
                    r"|[\d\s,.;:/+&()\[\]{}\"'`*_~|\-]")
# (4) a row is text-led when the Object column names one of these
TEXTY = re.compile(r"\b(?:title|subtitle|heading|headline|text|bullet|list|caption|keyword|quote|slogan|tagline|"
                   r"text card|word|words|kinetic type|lyrics?)\b", re.I)
# (2) Action: when these generic verbs and filler words are removed and nothing is left, there is no action.
WEAK = sorted("""appears appear appearing shows show showing shown displays display displayed presents present presented
reveals reveal revealed fades fade fading pops pop popping comes come enters enter entering exits exit slides slide
animates animate animated is are be being stays stay remains remain holds hold sits sit exists exist listed lists list
introduces introduce introduced explains explain explained highlights highlight highlighted emphasizes emphasize
emphasised emphasized labels label labelled labeled written writes typed in out up on onto into""".split(),
              key=len, reverse=True)
ACT_FILLER = re.compile(r"\b(?:a|an|the|of|and|with|or|then|also|again|one|by|after|before|while|slowly|gradually|"
                        r"quickly|one-by-one|each|all|together|screen|on-screen|frame|there|here|it|its|they|them)\b"
                        r"|[\d\s,.;:/+&()\[\]{}\"'`*_~|\-]")
# Camera column vocabulary: hold / slow push / pull back / glide / fast push / slam / cut / whip (usage and durations:
# see the ice-motion skill)
CAM_MOVE = ("push", "pull", "glide", "pan", "track", "truck", "dolly", "slam", "whip", "zoom", "orbit", "crane", "move", "tilt")
CAM_IN = ("slow push", "fast push", "push in", "push-in", "push", "slam", "zoom in", "zoom-in", "punch in", "punch-in", "dolly in")
CAM_ACCENT = ("fast push", "slam", "whip", "punch")
# (1) the Object column is only these words: an empty picture, not a layout element; the fix is different
EMPTY_SCENE = re.compile(r"\b(?:empty|blank|flat colou?r|solid colou?r|black screen|white screen|black frame|white frame|"
                         r"fade to black|gradient (?:ground|background)|negative space)\b|^(?:background|ground|black|white)$", re.I)
# (17) a reason that only points at the source or at taste is no reason (owner decision, 2026-10-29)
FILLER_REASON = re.compile(r"^(?:the |as in the |like the |from the |copied from the |same as the )?(?:reference|ref|style|decoration|decorative|looks? (?:good|nice|cool)|aesthetic|vibe|tbd|todo|\?+)\.?$", re.I)
EMPTY_CELL = {"", "-", "--", "none", "n/a", "na", "/", "(empty)", "empty"}
TEMPLATE = re.compile(r"\btemplate:([A-Za-z0-9_.-]+)", re.I)
# (12)-(14) style lock
LOCK = re.compile(r"^\s*[-*]?\s*(?:\*\*)?(style|palette|characters|allow blue-purple|style exception)(?:\*\*)?\s*:\s*(.+?)\s*$", re.I)
HEX = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
CHAR_BAD = re.compile(r"code[- ]drawn|chibi|robot|stick figure|little (?:man|person|people)|cartoon (?:man|person|people)|"
                      r"svg (?:person|people|character)", re.I)
CHAR_FRAMES = re.compile(r"frame library|frames|model sheet|\brig\b|\.png|/", re.I)
CHAR_NONE = re.compile(r"\bnone\b|\bno people\b|\bhands?\b|\bbacks?\b|silhouette", re.I)
OBJ_CHAR = re.compile(r"robot|stick figure|mascot|chibi|cartoon (?:man|person|character)|little (?:man|person)", re.I)
OBJ_FACE = re.compile(r"(?:face|smil|eyes|expression)\w*\W+(?:\w+\W+){0,4}?(?:coin|ball|ion|electron|particle|molecule)s?\b|"
                      r"\b(?:coin|ball|ion|electron|particle|molecule)s?\W+(?:\w+\W+){0,4}?(?:face|smil|eyes|expression)", re.I)


def read_lock(text, table_line=None):
    """Style lock lines outside the table: {style, palette, characters, allow blue-purple, style exception}. Lines in code
    fences do not count; when a line is repeated, the one closest before the table wins (after the table only if absent)."""
    before, after, fence = {}, {}, False
    for i, ln in enumerate(text.splitlines(), 1):
        if ln.strip().startswith("```"):
            fence = not fence; continue
        m = None if fence else LOCK.match(ln)
        if not m: continue
        key = m.group(1).lower()
        if table_line is None or i < table_line: before[key] = m.group(2).strip()
        else: after.setdefault(key, m.group(2).strip())
    return {**after, **before}


def blue_purple_hex(h):
    h = h if len(h) == 6 else "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b); d = mx - mn
    if d == 0 or mx == 0: return False
    hue = (((g - b) / d) % 6 if mx == r else (b - r) / d + 2 if mx == g else (r - g) / d + 4) * 60
    return 225 <= hue <= 300 and d / mx >= 0.30 and 0.06 <= mx <= 0.90


def strip_cells(line):
    s = line.strip()
    if s.startswith("|"): s = s[1:]
    if s.endswith("|"): s = s[:-1]
    return [c.strip() for c in s.split("|")]


def is_obj_head(h):
    return bool(re.search(r"object|subject", h, re.I))


def is_act_head(h):
    return bool(re.search(r"action|doing|does", h, re.I))


def find_table(text):
    """Returns (header, rows[(line number, cells)]). Skips code fences; takes the first table with Object and Action columns."""
    lines, fence, i = text.splitlines(), False, 0
    while i < len(lines):
        ln = lines[i]
        if ln.strip().startswith("```"):
            fence = not fence; i += 1; continue
        if not fence and ln.strip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|?\s*:?-{2,}", lines[i + 1]):
            head = strip_cells(ln)
            rows, j = [], i + 2
            while j < len(lines) and lines[j].strip().startswith("|"):
                rows.append((j + 1, strip_cells(lines[j]))); j += 1
            if any(is_obj_head(h) for h in head) and any(is_act_head(h) for h in head):
                return head, rows
            i = j; continue
        i += 1
    return None, []


def columns(head):
    col = {}
    for k, h in enumerate(head):
        hl = h.lower()
        if "time" in hl and "time" not in col: col["time"] = k
        elif is_obj_head(h) and "obj" not in col: col["obj"] = k
        elif is_act_head(h) and "act" not in col: col["act"] = k
        elif "camera" in hl and "cam" not in col: col["cam"] = k
        elif "tag" in hl and "tags" not in col: col["tags"] = k
        elif hl.strip() == "role" and "role" not in col: col["role"] = k
        elif ("text" in hl or "copy" in hl) and "text" not in col: col["text"] = k
        elif ("method" in hl or "how" in hl or "technique" in hl) and "how" not in col: col["how"] = k
        elif "trigger" in hl and "trig" not in col: col["trig"] = k
        elif ("reason" in hl or hl.strip() == "why") and "why" not in col: col["why"] = k
    return col


def parse_t(tok):
    tok = tok.strip()
    if ":" in tok:
        m, s = tok.split(":", 1)
        return int(m) * 60 + float(s)
    return float(tok)


def parse_span(cell):
    nums = re.findall(r"\d+:\d+(?:\.\d+)?|\d+(?:\.\d+)?", cell)
    if len(nums) < 2: return None
    a, b = parse_t(nums[0]), parse_t(nums[1])
    return (a, b) if b > a else None


def clean_cell(c):
    c = re.sub(r"<br\s*/?>", " ", c or "")
    return c.strip().strip("`*_").strip()


def is_empty(c):
    return clean_cell(c).lower() in EMPTY_CELL


def obj_residue(obj):
    s = " " + clean_cell(obj).lower() + " "
    for w in ABSTRACT: s = re.sub(r"\b" + re.escape(w.replace("-", " ")) + r"s?\b", " ", s)
    return FILLER.sub("", s)


def act_residue(act, obj=""):
    """What remains after removing generic verbs, layout words and the nouns of the Object column. "Bullet points appear
    one by one" and "the spores appear" both leave nothing."""
    s = " " + clean_cell(act).lower() + " "
    for w in sorted((t for t in re.split(r"[^\w]+", clean_cell(obj).lower()) if len(t) >= 2), key=len, reverse=True):
        s = re.sub(r"\b" + re.escape(w) + r"\b", " ", s)
    for w in WEAK + ABSTRACT:
        s = re.sub(r"\b" + re.escape(w.replace("-", " ")) + r"\b", " ", s)
    return ACT_FILLER.sub("", s)


def text_len(t):
    """Units of on-screen text: a CJK character counts one; a word or number in any other script counts one. Combining
    marks are removed first, so an Arabic word with a shadda or damma is still one unit."""
    t = strip_marks(clean_cell(t))
    if t.lower() in EMPTY_CELL: return 0
    t = re.sub(r"[\"'“”‘’«»]", "", t)
    return len(re.findall(r"[㐀-鿿]|[^\W_㐀-鿿]+(?:[.%°'][^\W_㐀-鿿]+)*%?", t))


def is_texty_object(obj):
    """The Object column names text as the thing in the picture: a text noun at the head of the phrase, before any
    'with', 'of', 'on', comma and the like ("headline over a photo" is text; "the rope ... of the word" is a rope)."""
    head = re.split(r"[,;(]|\b(?:with|of|on|over|into|in|under|behind|beside|above|below|against|from|that|which|while|as|"
                    r"carrying|holding|showing|and)\b", clean_cell(obj), maxsplit=1, flags=re.I)[0]
    return bool(TEXTY.search(head))


def how_kind(how):
    """Method column -> kind: a template family, code, footage, or the raw text."""
    h = clean_cell(how)
    if h.lower() in EMPTY_CELL: return None
    m = TEMPLATE.search(h)
    if m: return "template:" + m.group(1).lower()
    if re.search(r"kinetic type|type[- ]only|text card", h, re.I): return "kinetic"
    if re.search(r"\bscenes?\b|\.js\b|\bcode\b", h, re.I): return "code"
    if re.search(r"footage|screenshot|photo|recording|capture|live action|screen record", h, re.I): return "footage"
    return h


def clip_name(how):
    m = re.search(r"[^\s|,:()]+\.(?:json|html)\b", clean_cell(how))
    return m.group(0) if m else None


def tag_count(cell):
    """Tags column: split on commas, slashes, semicolons, middle dots; with no separator split on spaces."""
    c = clean_cell(cell)
    if c.lower() in EMPTY_CELL: return 0
    parts = [x for x in re.split(r"[,/;·•|]+", c) if x.strip()]
    if len(parts) <= 1: parts = c.split()
    return len(parts)


# (9) numbers: on screen only digits count; in the script both digits and English number words count (better to let a
# number through than to flag it wrongly). Arabic-Indic and Persian digits are converted.
DIGIT_MAP = {ord(c): str(i) for i, c in enumerate("٠١٢٣٤٥٦٧٨٩")}
DIGIT_MAP.update({ord(c): str(i) for i, c in enumerate("۰۱۲۳۴۵۶۷۸۹")})
DIGIT_MAP.update({0x066B: ".", 0x066C: ",", 0x066A: "%"})
UNITS = {w: i for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
                                    "fifteen sixteen seventeen eighteen nineteen".split())}
TENS = {w: 10 * (i + 2) for i, w in enumerate("twenty thirty forty fifty sixty seventy eighty ninety".split())}
SCALES = {"hundred": 100, "thousand": 10 ** 3, "million": 10 ** 6, "billion": 10 ** 9}
NUMWORD = "|".join(sorted(list(UNITS) + list(TENS) + list(SCALES) + ["point", "and", "a"], key=len, reverse=True))
WORD_NUM = re.compile(r"\b(?:" + "|".join(sorted(list(UNITS) + list(TENS), key=len, reverse=True)) +
                      r")(?:[\s-]+(?:" + NUMWORD + r"))*\b", re.I)
ARABIC = re.compile(r"\d+(?:,\d{3})*(?:\.\d+)?")
SRT_NOISE = re.compile(r"\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}|^\s*\d+\s*$", re.M)


def words_value(tok):
    """English number words -> [(value, decimals)]: "two thousand twenty-five" -> 2025, "fifteen point two" -> 15.2,
    "twenty twenty-five" read as a year -> 2025 as well."""
    toks = [t for t in re.split(r"[\s-]+", tok.lower()) if t and t not in ("and", "a")]
    if "point" in toks:
        k = toks.index("point")
        ip, fp = toks[:k], toks[k + 1:]
        frac = "".join(str(UNITS[t]) for t in fp if t in UNITS and UNITS[t] < 10)
        base = words_value(" ".join(ip))[0][0] if ip else 0.0
        return [(float(f"{int(base)}.{frac}"), len(frac))] if frac else [(base, 0)]
    total, cur, out = 0, 0, []
    for t in toks:
        if t in UNITS: cur += UNITS[t]
        elif t in TENS: cur += TENS[t]
        elif t == "hundred": cur = max(cur, 1) * 100
        elif t in SCALES: total += max(cur, 1) * SCALES[t]; cur = 0
    out.append((float(total + cur), 0))
    # a year said as two pairs ("twenty twenty-five", "nineteen ninety")
    pair = re.match(r"^(\w+)[\s-]+(\w+(?:[\s-]\w+)?)$", tok.lower())
    if pair and pair.group(1) in UNITS or pair and pair.group(1) in TENS:
        a = words_value(pair.group(1))[0][0]; b = words_value(pair.group(2))[0][0]
        if 10 <= a <= 99 and 0 <= b <= 99: out.append((a * 100 + b, 0))
    return out


def scaled(v, dec, after):
    """A number followed by k / M / B / thousand / million / billion: accept both the written number and the multiplied one
    (12k on screen = "twelve thousand" in the script). Returns [(value, decimals)]."""
    out = [(v, dec)]
    m = re.match(r"\s*(thousand|million|billion|[kK]\b|[mM]\b|[bB]\b)", after)
    if m:
        k = {"thousand": 3, "million": 6, "billion": 9, "k": 3, "m": 6, "b": 9}[m.group(1).lower()]
        out.append((v * 10 ** k, dec - k))
    return out


def arabic(tok):
    t = tok.replace(",", "")
    return float(t), len(t.partition(".")[2])


def screen_numbers(text):
    """Numbers in the on-screen text: [(as written, [(value, decimals)])]."""
    t = clean_cell(text).translate(DIGIT_MAP)
    return [(m.group(0), scaled(*arabic(m.group(0)), t[m.end():])) for m in ARABIC.finditer(t)]


def script_numbers(script):
    """Numbers said in the script: {(value, tolerance)}. The tolerance follows the script's precision: if it says
    "fifteen times", 15.2 on screen matches; if it says "fifteen point two", the screen must say 15.2."""
    s = SRT_NOISE.sub(" ", script.translate(DIGIT_MAP))
    have = []
    for m in ARABIC.finditer(s):
        have += scaled(*arabic(m.group(0)), s[m.end():])
    for m in WORD_NUM.finditer(s):
        for v, d in words_value(m.group(0)):
            have += scaled(v, d, s[m.end():])
    return {(round(v, 6), 0.5 * 10.0 ** -d + 1e-9) for v, d in have}


def number_in(vals, have):
    return any(abs(x - v) <= tol for x, _ in vals for v, tol in have)


def hue_families(hexes):
    """Palette hexes -> (number of hue families, description). Light and shadow tones of one hue are one family: chromatic
    values (saturation >= 0.15) are grouped when their hues sit within 30 degrees; near-greys count as one neutral family."""
    hues, neutral = [], 0
    for h in hexes:
        h = h if len(h) == 6 else "".join(c * 2 for c in h)
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        mx, mn = max(r, g, b), min(r, g, b); d = mx - mn
        if mx < 0.08 or d / max(mx, 1e-6) < 0.15:
            neutral = 1; continue
        hues.append((((g - b) / d) % 6 if mx == r else (b - r) / d + 2 if mx == g else (r - g) / d + 4) * 60)
    fams = []
    if hues:
        hs = sorted(hues)
        gaps = [(hs[(k + 1) % len(hs)] - hs[k]) % 360 for k in range(len(hs))]
        k0 = (max(range(len(hs)), key=lambda k: gaps[k]) + 1) % len(hs)      # start after the largest gap
        for v in hs[k0:] + hs[:k0]:
            if fams and (v - fams[-1][0]) % 360 <= 30: fams[-1].append(v)
            else: fams.append([v])
    desc = ", ".join(f"hue {round(f[0]):d}" + (f"-{round(f[-1]):d}" if len(f) > 1 else "") + f" ({len(f)} tone{'s' if len(f) > 1 else ''})" for f in fams)
    return len(fams) + neutral, desc + (", neutrals" if neutral else "")


def lint(text, script=None, scope=None):
    """Returns a dict: rows (per-row results), table (whole-table results), verdict, summary. script: the full voiceover
    script (optional); check (9) runs only when it is given. scope: resolve_scope() result (film type and its values);
    without it the default row of motion-density.md section 6 applies."""
    if scope is None:
        scope = resolve_scope()
    info_cap = int(num(scope["values"].get("cta_info_units")) or 0)
    head, raw = find_table(text)
    if head is None:
        return {"error": "No shot table found: a markdown table whose header has at least an Object column and an Action column (tables in code fences do not count)."}
    col = columns(head)
    miss = [n for k, n in (("time", "Time"), ("obj", "Object"), ("act", "Action"), ("cam", "Camera"), ("text", "On-screen text")) if k not in col]
    if miss:
        return {"error": "Shot table is missing column(s): " + ", ".join(miss) + ". Columns: Time | Object | Action | Camera | On-screen text | Method."}
    get = lambda cells, k: cells[col[k]] if k in col and col[k] < len(cells) else ""
    rows, table = [], []
    for n, (lineno, cells) in enumerate(raw, 1):
        if all(is_empty(c) for c in cells): continue
        obj, act, cam, txt, how = (get(cells, k) for k in ("obj", "act", "cam", "text", "how"))
        span = parse_span(get(cells, "time"))
        r = {"n": len(rows) + 1, "line": lineno, "obj": clean_cell(obj), "act": clean_cell(act), "cam": clean_cell(cam),
             "text": clean_cell(txt), "how": clean_cell(how), "span": span, "dur": (span[1] - span[0]) if span else None,
             "chars": text_len(without_required_labels(txt)), "issues": [], "cta_tag": is_cta_block(get(cells, "tags"))}
        bad = r["issues"].append
        if is_empty(obj):
            bad((RED, "(1) object", "the Object column is empty", "write one thing in the picture you could point at and say 'that one': a person, a hand, a machine, a specific object"))
        elif not obj_residue(obj) and EMPTY_SCENE.search(clean_cell(obj)):
            bad((RED, "(1) object", f"'{r['obj']}' is an empty picture (blank, flat colour, black screen): the protagonist is not in it", "this shot also needs the protagonist or main object doing something; for a breath, let it stop or pull back, do not remove it"))
        elif not obj_residue(obj):
            bad((RED, "(1) object", f"'{r['obj']}' is a layout element, not an object", "behind every point there is a thing doing something; draw it: 'three reasons' becomes three specific things, one shot each, each doing one thing"))
        if is_empty(act):
            bad((RED, "(2) action", "the Action column is empty", "write a verb: falls, cracks, slides into, gets cut off"))
        elif not act_residue(act, obj):
            bad((RED, "(2) action", f"'{r['act']}' only appears or shows, there is no action", "write the object's own action: where it comes from, where it goes, what it hits, what it turns into"))
        # a CTA block row may carry its facts as text; it is text-led only by its Object or Method
        r["texty"] = is_texty_object(r["obj"]) or (r["chars"] >= 7 and not r["cta_tag"]) or how_kind(how) == "kinetic"
        if span is None:
            bad((RED, "(6) duration", f"time span '{clean_cell(get(cells, 'time'))}' cannot be read", "write it as 0-3 or 0:03-0:07"))
        elif r["dur"] > 8:
            bad((RED, "(6) duration", f"this shot is {r['dur']:g} s, over 8 s", "split it into two or three shots of 2-6 s each, with a new picture or a new camera move"))
        elif r["dur"] > 6:
            bad((YELLOW, "(6) duration", f"this shot is {r['dur']:g} s (6-8 s is allowed only rarely)", "split it if you can; if not, make something new happen in it: the object's next action, a glide to the next thing, a pull back to the whole"))
        elif r["dur"] < 2:
            bad((YELLOW, "(6) duration", f"this shot is only {r['dur']:g} s", "an insert can be short; if the voiceover cannot finish a sentence here, merge it with a neighbour"))
        if is_empty(cam):
            bad((YELLOW, "camera", "the Camera column is empty", "write one: hold / slow push / pull back / glide / fast push / slam / cut"))
        if "tags" in col:
            r["tags"] = tag_count(get(cells, "tags"))
            if r["tags"] > 3:
                bad((YELLOW, "(10) tags", f"{r['tags']} tags in this shot, crowded", "at most 3 per shot; move the rest to the voiceover or the next shot; place each tag next to the object it names, never a row of glowing pills"))
        for k, name, what in (("trig", "trigger", "the script sentence or word that justifies this element, with its time (for a film without speech: the music or sound cue, or the story event)"),
                              ("why", "reason", "what the element means, who or what it is on, and why its colour and shape")):
            if k in col:
                cell = clean_cell(get(cells, k))
                if is_empty(cell) or FILLER_REASON.match(cell):
                    bad((RED, f"(17) {name}", f"the {name.capitalize()} cell is empty or only names the source or a taste ('{cell}')",
                         f"write {what}; an element with no trigger and no reason is cut before 05"))
        rows.append(r)
    if not rows:
        return {"error": "The shot table is empty: one row per shot under the header."}

    # (3) on-screen text: at most 8 units per shot. Scoped exception (the ice-film skill, film-types/industry-spot.md, Text
    # density): the end-card rows tagged `CTA block` in the Tags column, in a type whose cta_info_units is above 0
    # (motion-density.md section 6), may carry the facts a viewer needs to act (name, date, time, place, store line or
    # link) up to 8 + cta_info_units units
    for r in rows:
        cap = 8 + (info_cap if r["cta_tag"] else 0)
        if r["chars"] > cap:
            hint = ""
            if r["cta_tag"] and not info_cap:
                hint = f" (the film type '{scope['row']}' has no CTA block allowance)"
            elif r["cta_tag"]:
                hint = f" (CTA block limit for the film type '{scope['row']}')"
            fix = "keep one word or half a sentence; give the rest to the voiceover or captions"
            if r["cta_tag"]:
                fix = "keep only the facts the viewer needs to act (name, one date, one time range, one place or one store line); split them across at most three end shots tagged CTA block that each add one fact"
            elif info_cap and r["n"] >= len(rows) - 2:
                fix += f"; if these are end-card facts (date, time, place, store line), tag the end-card rows `CTA block` in the Tags column: the film type '{scope['row']}' allows up to {cap + info_cap} units there"
            r["issues"].append((RED, "(3) on-screen text", f"{r['chars']} units of on-screen text, more than {cap}{hint}", fix))
        elif r["cta_tag"] and r["chars"] > 8:
            r["note"] = f"CTA block: {r['chars']} units, allowed up to {cap} for the film type '{scope['row']}'"

    # (17) trigger and reason columns (owner decision, 2026-10-29): results were blind copies of a reference; every
    # appearance of an element is tied to the sentence that justifies it and carries its reason
    miss_tr = [n for k, n in (("trig", "Trigger"), ("why", "Reason")) if k not in col]
    if miss_tr:
        table.append((RED, "(17) trigger and reason", f"no {' and no '.join(miss_tr)} column",
                      "add a Trigger column (the script sentence or word with its time that justifies the row) and a Reason column (what the element means, who it is on, why its colour and shape); a row with no trigger and reason is cut"))

    # (4) first shot
    f = rows[0]
    if f["texty"]:
        f["issues"].append((RED, "(4) opening", "the first shot is text-led (title or text)", "replace the first 3 seconds with a small concrete scene: a person or object doing something about the subject; give the title one shot later, or not at all"))
    elif f["chars"] >= 4:
        f["issues"].append((YELLOW, "(4) opening", f"the first shot already has {f['chars']} units of text", "let the picture speak first; keep the words for the second shot"))
    # (8) last shot
    z = rows[-1]
    if len(rows) > 1 and z["texty"]:
        z["issues"].append((RED, "(8) ending", "the last shot is text-led (centred quote card or pure text card)",
                            "end on the protagonist or main object doing something (puts it away, closes the book, pull back to the whole); words may sit on an object in the picture, never a separate text card"))
    # (11) a number card in the middle: blind reviews kept reading a separate flat number card as "a slide was inserted"
    for r in rows[1:-1]:
        if r["texty"] and screen_numbers(r["text"]):
            r["issues"].append((YELLOW, "(11) number card", "this shot is a separate number text card",
                                "land the number on an object in the world (a phone screen, a battery bar, a price tag, a board, paper), not on a separate flat card"))
    # (9) on-screen numbers against the script
    if script is not None:
        have = script_numbers(script)
        for r in rows:
            miss = [tok for tok, vals in screen_numbers(r["text"]) if not number_in(vals, have)]
            if miss:
                r["issues"].append((RED, "(9) numbers", f"on-screen number(s) {', '.join(repr(m) for m in miss)} not found in the script: screen and voiceover disagree",
                                    "check the source and make the screen say the number the voiceover says (or change the voiceover); both must be the same number. Arabic number words are not parsed: confirm those by hand"))
    # (7) three shots in a row with the same camera
    for k in range(2, len(rows)):
        c = rows[k]["cam"].lower()
        if c and not is_empty(c) and c not in ("hold", "glide") and c == rows[k - 1]["cam"].lower() == rows[k - 2]["cam"].lower():   # holds may run together; gliding from item to item along a desk is normal
            alt = " / ".join(w for w in ("hold", "slow push", "pull back", "glide", "cut") if w != c)
            rows[k]["issues"].append((YELLOW, "(7) camera", f"three shots in a row are '{rows[k]['cam']}'", f"change the middle one to: {alt}, chosen by what the viewer must look at in that shot"))
    # (15) three shots in a row pushing in: a push in every shot turns the film into push after push (a 102 s explainer
    # with about 48 push-ins was judged "too many, too fast, not smooth")
    inward = [any(w in r["cam"].lower() for w in CAM_IN) and "pull" not in r["cam"].lower() and "out" not in r["cam"].lower() for r in rows]
    for k in range(2, len(rows)):
        if inward[k] and inward[k - 1] and inward[k - 2] and not any(i[1] == "(7) camera" for i in rows[k]["issues"]):
            rows[k]["issues"].append((YELLOW, "(15) push-in", "three shots in a row push in", "after pushing in, come back out: put a hold, a pull back or a glide in the middle, or a hard cut to a new framing; hold when live footage moves by itself"))
    # time span continuity
    for k in range(1, len(rows)):
        a, b = rows[k - 1]["span"], rows[k]["span"]
        if a and b and abs(b[0] - a[1]) > 0.05:
            rows[k]["issues"].append((YELLOW, "time", f"the previous shot ends at {a[1]:g}s, this one starts at {b[0]:g}s", "join them, or state that an empty shot sits here"))

    n = len(rows)
    texty = [r["n"] for r in rows if r["texty"]]
    if len(texty) / n > 0.30:
        table.append((RED, "(5) text share", f"text-led shots {len(texty)}/{n} ({len(texty) / n:.0%}), over 30%: shot(s) {', '.join(map(str, texty))}",
                      "pick half of them and replace the words with an object doing something; give the words to the voiceover and captions"))
    long_ = [r["n"] for r in rows if r["dur"] and 6 < r["dur"] <= 8]
    if len(long_) > max(1, n // 5):
        table.append((RED, "(6) duration", f"{len(long_)} shots run 6-8 s (shot(s) {', '.join(map(str, long_))}); only a few are allowed",
                      "split them, 2-6 s per shot"))
    if not any(any(w in r["cam"].lower() for w in CAM_MOVE) for r in rows):
        table.append((YELLOW, "camera", "no camera move in the whole table, only holds and cuts", "the delivery gate measures in-shot motion and an all-hold film usually goes red; put a slow push, a glide or a pull back where the viewer's eye must be led (an object's own action also counts as motion)"))
    acc = [r["n"] for r in rows if any(w in r["cam"].lower() for w in CAM_ACCENT)]
    if n >= 6 and len(acc) * 3 > n:
        table.append((YELLOW, "(16) accents", f"fast push / slam / whip on {len(acc)}/{n} shots (shot(s) {', '.join(map(str, acc))}): too many accents means no accent",
                      "keep them for the reveal, the turn and the key number; make the rest a slow push, a glide, a pull back or a hold"))
    total = sum(r["dur"] or 0 for r in rows)
    lock = read_lock(text, raw[0][0] - 2 if raw else None)
    if "how" in col:
        clips = {}
        for r in rows:
            c = clip_name(r["how"])
            if c: clips.setdefault(c, []).append(r)
        for c, rs in clips.items():
            s = sum(r["dur"] or 0 for r in rs)
            if s > 8:
                table.append((RED, "method", f"reusable template/clip {c} carries {s:g} s (shot(s) {', '.join(str(r['n']) for r in rs)})",
                              "one parameterized template or clip runs at most 8 s in total, longer reads as a slide; split it into several and use other methods in between"))
        fams = sorted({k for k in (how_kind(r["how"]) for r in rows) if k and k.startswith("template:")})
        if len(fams) > 2:
            lv = YELLOW if lock.get("style exception") else RED
            table.append((lv, "method", f"{len(fams)} template families mixed ({', '.join(fams)}): together they read as several styles" + (" (style exception declared)" if lv == YELLOW else ""),
                          "at most 2 template families per film, all on the same palette; draw the other shots in code with that palette, or use real footage full frame"))
        empty_how = [r["n"] for r in rows if how_kind(r["how"]) is None]
        if empty_how:
            table.append((YELLOW, "method", f"shot(s) {', '.join(map(str, empty_how))} have no method", "write which template (template:<name> or the file), code scene, or footage each shot uses"))
    else:
        table.append((YELLOW, "method", "no Method column: cannot check how long one template runs or how many families are mixed", "add a column: template:<name> / code scene / footage <file>"))

    # (12)-(14) style lock: one visual language for the whole film, no blue-purple palette, characters either built
    # properly or not shown
    miss = [k.capitalize() for k in ("style", "palette", "characters") if not lock.get(k)]
    if miss:
        table.append((RED, "(12) style lock", f"missing line(s) before the table: {', '.join(miss)}", "write three lines before the table: Style: one sentence, one style for the whole film; Palette: hex values with roles for 3-6 hue families, tonal steps allowed (from ice/DIRECTION.md); "
                      "Characters: none / hands and backs only / frame library <path> / rig <path>"))
    pal = lock.get("palette", "")
    if pal:
        hexes = HEX.findall(pal)
        bp = [f"#{h}" for h in hexes if blue_purple_hex(h)]
        if bp:
            table.append((YELLOW if lock.get("allow blue-purple") else RED, "(13) palette", f"blue-purple in the palette: {', '.join(bp)}" + (" (reason for blue-purple given)" if lock.get("allow blue-purple") else ""),
                          "move these values out of hue 225-300 deg or choose another palette (ice-direction skill); only when the user asked for blue or purple write 'Allow blue-purple: <reason>'"))
        nfam, fdesc = hue_families(hexes)
        if nfam > 6:
            table.append((YELLOW, "(13) palette", f"the palette has {nfam} hue families ({fdesc})", "3-6 hue families per film: ground, surface, main ink, secondary ink, one or two accents; light and shadow tones of one hue count once"))
        if not hexes:
            table.append((YELLOW, "(13) palette", f"palette '{pal}' has no hex values", "write the #hex values with roles (3-6 hue families, light and shadow steps allowed), copied from ice/DIRECTION.md"))
    ch = lock.get("characters", "")
    frames = bool(ch and CHAR_FRAMES.search(ch))
    if ch and CHAR_BAD.search(ch) and not frames:
        table.append((RED, "(14) characters", f"Characters says '{ch}': code-drawn little people and robots are retired", "with image generation available, build a frame library or rig (ice-styles skill); without one, show only hands, backs or silhouettes, or no people"))
    for r in rows:
        if OBJ_CHAR.search(r["obj"]) and not frames:
            r["issues"].append((RED, "(14) characters", f"the Object column has '{OBJ_CHAR.search(r['obj']).group(0)}' but Characters is not a frame library or rig",
                                "use a hand, a back or an object in this shot; to show a character, build its frame library or rig first"))
        if OBJ_FACE.search(r["obj"] + " " + r["act"]):
            r["issues"].append((YELLOW, "(14) characters", "a face on a coin, ball, ion or similar thing", "draw the thing as a thing: tell it with shape, colour and action, without an expression (unless one approved anthropomorphic protagonist)"))

    issues = [x for r in rows for x in r["issues"]] + table
    verdict = RED if any(x[0] == RED for x in issues) else YELLOW if issues else GREEN
    numbered = [r["n"] for r in rows if screen_numbers(r["text"])]
    return {"rows": rows, "table": table, "verdict": verdict, "total": total, "texty": texty,
            "script": script is not None, "numbered": numbered, "scope": scope}


def report(res):
    if "error" in res: return [res["error"]]
    sc = res["scope"]
    L = [f"Film type: {sc['type_text'] or 'unknown'} ({sc['type_source'] or 'not found'}) -> row '{sc['row']}' of motion-density.md section 6; "
         f"CTA info allowance {int(num(sc['values'].get('cta_info_units')) or 0)} units"]
    L += [f"  note: {n}" for n in sc["notes"]]
    for r in res["rows"]:
        light = RED if any(x[0] == RED for x in r["issues"]) else YELLOW if r["issues"] else GREEN
        span = f"{r['span'][0]:g}-{r['span'][1]:g}s" if r["span"] else "?"
        L.append(f"[{light}] shot {r['n']}  {span:<10} {r['obj'][:30]}")
        for lv, tag, what, fix in r["issues"]:
            L.append(f"      [{lv}] {tag}: {what}. Fix: {fix}")
        if r.get("note"):
            L.append(f"      note: {r['note']}")
    L.append("")
    L.append(f"Table: {len(res['rows'])} shots, {res['total']:g} s, text-led {len(res['texty'])} shot(s)")
    for lv, tag, what, fix in res["table"]:
        L.append(f"  [{lv}] {tag}: {what}. Fix: {fix}")
    L.append("")
    L.append({RED: "Verdict: RED. Fix the shot table and run this command again; do not start code until the reds are gone.",
              YELLOW: "Verdict: YELLOW. You may start; think through a reason for each yellow and write it in the delivery report.",
              GREEN: "Verdict: GREEN. You may start."}[res["verdict"]])
    if not res.get("script") and res.get("numbered"):
        L.append(f"Shot(s) {', '.join(map(str, res['numbered']))} show numbers: add --script script.txt to check they match the voiceover.")
    L.append("Not machine-checkable, check by hand: one concrete example runs through the whole film; one style throughout; adjacent shots have different compositions; the first 3 seconds are a small scene, not the topic.")
    return L


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    if any(a in ("-h", "--help") for a in argv):
        print(__doc__); return 0
    sp, ftype = None, None
    if "--type" in argv:
        k = argv.index("--type")
        if k + 1 >= len(argv):
            print("--type needs a film type, for example --type \"industry spot\"", file=sys.stderr); return 2
        ftype = argv[k + 1]; del argv[k:k + 2]
    if "--script" in argv:
        k = argv.index("--script")
        if k + 1 >= len(argv):
            print("--script needs a path to the script", file=sys.stderr); return 2
        sp = Path(argv[k + 1]); del argv[k:k + 2]
    if len(argv) != 1:
        print(__doc__); return 2
    p = Path(argv[0])
    try:
        text = p.read_text(encoding="utf-8")
        script = sp.read_text(encoding="utf-8") if sp else None
    except OSError as e:
        print(f"cannot read {e.filename}: {e.strerror}", file=sys.stderr); return 2
    try:
        scope = resolve_scope(ftype, (p, Path.cwd()))
    except (OSError, ValueError) as e:
        print(f"cannot read the scoped gate table: {e}", file=sys.stderr); return 2
    res = lint(text, script, scope)
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass
    print("\n".join(report(res)))
    if "error" in res: return 2
    return 1 if res["verdict"] == RED else 0


if __name__ == "__main__":
    sys.exit(main())
