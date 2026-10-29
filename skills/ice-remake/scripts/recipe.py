"""recipe.py: write a portable style recipe from a measured reference.

    python recipe.py --ref <ice>/reference/<ref-id> [--brief <ice>/BRIEF.md] [--sound-map <path>]
                     [--mode "structural fidelity"|frame-locked|translation|inspiration|mix]
                     [--kind video|site|image-set] [--slot name=value ...] [--date YYYY-MM-DD]

Reads, all local files, no network:
    <ref>/analysis/report.json   analyze.py output (required)
    <ref>/ANALYSIS.md            notes, including its "## Recipe notes" block and "## Finishing layer" table (optional)
    <ref>/TIMELINE.md            per-shot table: the "transition in" column (optional)
    <ref>/REASONS.md             element reasons table and its "## Never" block (optional; notes-files.md section 6)
    <ref>/TIMELINE.md            also its "## Events" table (pacing events the analyzer misses)
    <ref>/peaks.json             confirmed peaks (optional; else the analyzer's peak candidates)
    <ref>/sound_map.json         the ice-audio sound map (optional; also looked for in <ref>/analysis/)
    <ref>/analysis/events.json   pacing events (optional; else measured from report.json and the TIMELINE.md Events table)
    <ref>/analysis/depth.json    depth, 3D and camera measures (optional; measuring.md "Depth, 3D and camera")
    the brief's References block line for this ref-id: kind and mode (flags override it)
Writes into <ref>:
    STYLE-RECIPE.md              the recipe a person reads and pastes into Claude
    style-recipe.json            its machine twin
With --events it writes only <ref>/analysis/events.json (measuring.md "Pacing events") and prints the longest gap and
the events per minute.
Format: references/style-recipe.md. Nothing is invented: a value no file holds is written as unknown together with
what would measure it. No rights gate (references/rights-and-modes.md section 1): the recipe carries the full style,
skin included, with one neutral line that rights are the user's responsibility; the reference's own media go in as
they are or are recreated, as the identity slot says (asked at stage 01 when open).
"""
import argparse, datetime, json, os, re, statistics, sys

RECIPE_VERSION = 1
SLOTS = ["content", "brand", "product_truth", "language", "length", "aspect", "must_include"]
SLOT_HELP = {
    "content": "footage:<path to the user's B-roll or footage folder> or from-scratch",
    "brand": "the brand the new piece is for, or none",
    "product_truth": "what the product or subject really does, from the user's own material",
    "language": "language and dialect of every word on screen and in the voice",
    "length": "runtime in seconds of the new piece",
    "aspect": "aspect ratio of the new piece (and any extra ratios)",
    "must_include": "anything the new piece has to show or say",
}
MODES = ("structural fidelity", "frame-locked", "translation", "inspiration", "mix")
RIGHTS_LINE = "Rights to use the reference are the user's responsibility."
TAKEN = ["rhythm and shot length distribution", "cut positions relative to beats", "transition families and seam carry-overs",
         "camera move types and speeds", "density curve and stillness ratio", "type behaviour, size ratios and typefaces",
         "composition and layout", "climax anatomy (build, held breath, hit, hold)", "motif and rhyme structure",
         "palette values and relationships (light and dark ratio, saturation, accent rule)", "material, texture and light mood",
         "sound design and music style (genre, tempo, energy, structure, SFX types and placement, mix levels)"]
OWN_MEDIA = ["its footage and frames", "its music track and lyrics (or new music in the same genre, tempo, energy and structure)",
             "its voice-over", "its sound effect recordings (or new effects of the same types at the same moments)",
             "its logos and end card", "its characters"]
IDENTITY = ("identity slot: its own media and identity as they are, the same style with my identity, a mix named per element, "
            "or the style only; outside items are recorded with their license status (ice-assets references/sourcing-and-licenses.md section 0)")
PEOPLE = "real people's faces and voices: ice-assets references/ai-media-policy.md section 9"


def unknown(measure_with):
    return {"value": "unknown", "measure_with": measure_with}


def is_unknown(v):
    return isinstance(v, dict) and v.get("value") == "unknown"


def load_json(path):
    if not path or not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8-sig") as f:
        return json.load(f)


def read_text(path):
    if not os.path.isfile(path):
        return ""
    with open(path, encoding="utf-8-sig") as f:
        return f.read()


def rnd(x, n=2):
    return None if x is None else round(float(x), n)


def pct(x):
    return None if x is None else round(100 * float(x))


def quantiles(vals):
    s = sorted(vals)
    if not s:
        return None
    def at(q):   # linear interpolation between ranks (nearest rank hides the longest shot on a short list)
        x = q * (len(s) - 1); i = int(x); f = x - i
        return s[i] if i + 1 >= len(s) else s[i] + (s[i + 1] - s[i]) * f
    return {"p10": rnd(at(0.1)), "p25": rnd(at(0.25)), "median": rnd(at(0.5)), "p75": rnd(at(0.75)), "p90": rnd(at(0.9))}


# ------------------------------------------------------------------ notes

def brief_line(brief_text, ref_id):
    """kind and mode from the brief's References block line for this ref-id."""
    out = {}
    for line in brief_text.splitlines():
        cells = [c.strip() for c in line.strip().lstrip("-").split("|")]
        if len(cells) >= 3 and cells[0] == ref_id:
            out["kind"] = cells[1]
            for c in cells[2:]:
                k, _, v = c.partition(":")
                if k.strip() in ("rights", "mode", "function") and v.strip():
                    out[k.strip()] = v.strip()
    return out


def recipe_notes(analysis_text):
    """The labelled lines of the "## Recipe notes" block of ANALYSIS.md, plus its Medium line."""
    notes, inside = {}, False
    for line in analysis_text.splitlines():
        if line.startswith("## "):
            inside = line.lower().startswith("## recipe notes")
            continue
        m = re.match(r"\s*([A-Za-z][A-Za-z -]+?):\s*(.+)$", line)
        if not m:
            continue
        key, val = m.group(1).strip().lower(), m.group(2).strip()
        if key == "medium" and "medium" not in notes:
            notes["medium"] = val.split()[0]
        elif inside and val and not val.startswith("<") and val.lower() != "unknown":
            notes[key] = val
    return notes


def _col(cell):
    """A table header cell as a key: lower case, no bracketed part, words joined by underscores."""
    return re.sub(r"[^a-z0-9]+", "_", re.sub(r"\(.*?\)", "", cell).lower()).strip("_")


def md_tables(text):
    """Every Markdown table of a text: its header keys and its body rows (separator rows skipped)."""
    tables, cur = [], None
    for line in text.splitlines():
        t = line.strip()
        if not t.startswith("|"):
            cur = None
            continue
        cells = [c.strip() for c in t.strip("|").split("|")]
        if cur is None:
            cur = {"head": [_col(c) for c in cells], "rows": []}
            tables.append(cur)
        elif not all(set(c) <= set("-: ") for c in cells):
            cur["rows"].append(cells)
    return tables


def md_section(text, title):
    """The lines under "## <title>..." up to the next "## " heading."""
    out, inside = [], False
    for line in text.splitlines():
        if line.startswith("## "):
            inside = line[3:].strip().lower().startswith(title.lower())
            continue
        if inside:
            out.append(line)
    return "\n".join(out)


def table_rows(text, must, drop=()):
    """Rows of the first table whose header has the column `must`, as dicts; placeholder rows skipped, a cell
    written "unknown: <what would settle it>" kept as an unknown."""
    for tb in md_tables(text):
        if must not in tb["head"]:
            continue
        out = []
        for cells in tb["rows"]:
            if not any(c and not c.startswith("<") for c in cells):
                continue
            row = {}
            for k, c in zip(tb["head"], cells):
                if not k or k in drop:
                    continue
                row[k] = unknown(c.partition(":")[2].strip() or "the evidence named in notes-files.md section 6") if c.lower().startswith("unknown") else c
            out.append(row)
        return out
    return []


def element_reasons(reasons_text):
    """The reference's element reasons (REASONS.md), without the quoted instances and evidence paths."""
    rows = table_rows(reasons_text, "element", drop=("trigger_instances", "evidence"))
    return rows or unknown("no reasons table yet: write REASONS.md during the watch (notes-files.md section 6)")


def never_rules(reasons_text):
    """The "## Never" block of REASONS.md: one rule per bullet, each a count of 0 over measured chances."""
    rules = [re.sub(r"^\s*[-*]\s*", "", l).strip() for l in md_section(reasons_text, "Never").splitlines()]
    rules = [r for r in rules if r and not r.startswith("<")]
    return rules or unknown("## Never block of REASONS.md: what the reference never does, each as 0 of the chances counted (notes-files.md section 6)")


def finishing(analysis_text):
    """The Finishing layer table of ANALYSIS.md: effect, where, how much, measured how, why (measuring.md section 9)."""
    rows = table_rows(md_section(analysis_text, "Finishing layer"), "effect")
    if len(rows) == 1 and str(rows[0].get("effect", "")).lower().startswith("none"):
        return "none seen"
    return rows or unknown("Finishing layer table of ANALYSIS.md: where, how much and why for each effect (measuring.md section 9)")


GRADUAL = ("morph", "dissolve", "crossfade", "cross-fade", "fade", "wipe", "match", "gradual", "whip", "push", "zoom", "continuous")


def family_name(cell):
    """A family name from a "transition in" cell: the words before the first comma, semicolon or bracket, at most four."""
    head = re.split(r"[,;(:]", cell, maxsplit=1)[0].strip()
    return " ".join(head.split()[:4]) or "unknown"


def is_hard(family):
    f = family.lower()
    return "cut" in f and not any(w in f for w in GRADUAL)


def timeline_transitions(timeline_text):
    """The "transition in" column of the TIMELINE.md per-shot table, one family name per row, in row order. Only the
    first table with that column is read, so the "## Events" table below it never adds families."""
    for tb in md_tables(timeline_text):
        col = next((i for i, k in enumerate(tb["head"]) if k.startswith("transition")), None)
        if col is None:
            continue
        return [family_name(r[col].lower()) if r[col] else "unknown" for r in tb["rows"] if col < len(r)]
    return []


# ------------------------------------------------------------------ pacing events (measuring.md "Pacing events")

EVENT_KINDS = ("cut", "camera", "graphic", "flash", "sound", "hold")
STILL_KINDS = ("static", "drift")


def _secs(cell):
    m = re.match(r"\s*(-?[0-9]+(?:\.[0-9]+)?)", str(cell or ""))
    return float(m.group(1)) if m else None


def timeline_events(timeline_text):
    """Rows of the "## Events" table of TIMELINE.md: t s, kind, end s (holds only), note. The kind is its first word
    ("graphic in" is a graphic with the note "in"); a row whose time or kind cannot be read is skipped."""
    out = []
    for row in table_rows(md_section(timeline_text, "Events"), "kind"):
        t = _secs(next((v for k, v in row.items() if k in ("t", "t_s", "time", "time_s", "at", "at_s")), None))
        words = str(row.get("kind", "")).lower().split()
        if t is None or not words or words[0] not in EVENT_KINDS:
            continue
        ev = {"t": round(t, 3), "kind": words[0], "source": "TIMELINE.md"}
        note = " ".join(words[1:] + ([row["note"]] if isinstance(row.get("note"), str) and row["note"] else []))
        end = _secs(next((v for k, v in row.items() if k in ("end", "end_s")), None))
        if ev["kind"] == "hold" and end is not None:
            ev["end"] = round(end, 3)
        if note:
            ev["note"] = note
        out.append(ev)
    return out


def gap_stats(events, duration):
    """Longest gap (0 and the duration are the bounds) and events per minute, holds excluded (lesson L9)."""
    ts = sorted(e["t"] for e in events if (e.get("kind") or e.get("type")) != "hold" and 0 <= e["t"] <= duration)
    bounds = [0.0] + ts + [float(duration)]
    gap, at = max(((b - a, [a, b]) for a, b in zip(bounds, bounds[1:])), key=lambda x: x[0])
    return {"longest_gap": round(gap, 3), "longest_gap_at": [round(at[0], 3), round(at[1], 3)],
            "events_per_minute": round(len(ts) / duration * 60, 2) if duration else None}


def pacing_events(rep, timeline_text):
    """The reference's events file: every authored visual change analyze.py finds (cuts and gradual seams, camera move
    starts, overlays popping, revealing or scaling in or out, fades, flashes) plus the rows of the TIMELINE.md "## Events"
    table (graphics in and out, camera moves the analyzer's half-second sampling misses). Same kind within one frame
    counts once. Schema: measuring.md "Pacing events"."""
    v = rep.get("video") or {}
    dur, fps = v.get("duration"), v.get("fps")
    if not dur:
        return None
    one = 1 / fps if fps else 0.04
    ev = []
    kinds = {round(b["t"], 2): b["kind"] for b in rep.get("boundaries") or []}
    for a, _ in (rep.get("shots") or [])[1:]:
        ev.append({"t": round(a, 3), "kind": "cut", "source": "analyze.py shots",
                   **({"note": "gradual seam"} if kinds.get(round(a, 2)) == "gradual" else {})})
    for x in rep.get("shot_details") or []:
        cam = x.get("camera") or {}
        segs = cam.get("segments") or [{"start": x["start"], "kind": cam.get("kind") or ["static"]}]
        prev = None
        for sg in segs:
            moving = [k for k in sg["kind"] if k not in STILL_KINDS]
            if moving and moving != prev:
                ev.append({"t": round(sg["start"], 3), "kind": "camera", "note": "/".join(moving), "source": "analyze.py camera segments"})
            prev = moving
    for f in rep.get("flashes") or []:
        ev.append({"t": round(f.get("t", 0) if isinstance(f, dict) else f, 3), "kind": "flash", "source": "analyze.py flashes"})
    st = rep.get("structure") or {}
    for o in st.get("overlays") or []:
        ev.append({"t": round(o["start"], 3), "kind": "graphic", "note": f"overlay {o['kind']}", "source": "analyze.py structure"})
    for f in st.get("fades") or []:
        ev.append({"t": round(f["start"], 3), "kind": "cut", "note": f["kind"].replace("_", " "), "source": "analyze.py structure"})
    for h in st.get("black") or []:
        ev.append({"t": round(h["start"], 3), "kind": "hold", "end": round(h["end"], 3), "note": "black hold", "source": "analyze.py structure"})
    ev += timeline_events(timeline_text)
    ev.sort(key=lambda e: (e["t"], e["kind"]))
    kept = []
    for e in ev:
        if any(k["kind"] == e["kind"] and abs(k["t"] - e["t"]) < one - 1e-9 for k in kept[-8:]):
            continue
        kept.append(e)
    out = {"duration": rnd(dur, 3), **({"fps": fps} if fps else {}), "events": kept}
    out.update(gap_stats(kept, dur))
    out["counted"] = "every event except hold; longest gap bounded by 0 and the duration (measuring.md \"Pacing events\")"
    return out


def pacing(rep, notes, timeline_text, events_file=None):
    """The grammar's pacing block: the stored events file when there is one (it may hold hand-checked rows), else the
    events measured now; the Pacing line of the Recipe notes is kept as a note."""
    stored = events_file if isinstance(events_file, list) else (events_file or {}).get("events") if isinstance(events_file, dict) else None
    data = {"duration": events_file.get("duration") if isinstance(events_file, dict) else None, "events": stored} if stored else pacing_events(rep, timeline_text)
    dur = (data or {}).get("duration") or (rep.get("video") or {}).get("duration")
    if not data or not dur:
        return unknown("analysis/events.json from recipe.py --events, after analyze.py (measuring.md \"Pacing events\"), and the Pacing line of the Recipe notes")
    evs = [{**e, "kind": e.get("kind") or e.get("type")} for e in data["events"]]   # the film's events file writes "type"
    out = {**gap_stats(evs, dur), "events": sum(1 for e in evs if e["kind"] != "hold"),
           "by_kind": {k: sum(1 for e in evs if e["kind"] == k) for k in EVENT_KINDS if any(e["kind"] == k for e in evs)},
           "source": "analysis/events.json" if stored else "analyze.py report and the TIMELINE.md Events table"}
    if notes.get("pacing"):
        out["note"] = notes["pacing"]
    return out


def seams(rep, fams):
    """Every analyzer shot boundary with what it is: the TIMELINE.md family when the table has one row per shot, else
    analyze.py's boundary kind (one-frame change = hard cut; spread change = gradual), else an unchecked hard cut.
    Only hard cuts feed the cutting statistics."""
    shots = rep.get("shots") or []
    kinds = {round(b["t"], 2): b["kind"] for b in rep.get("boundaries") or []}
    out = []
    for i, (a, _) in enumerate(shots[1:], 1):
        if len(fams) == len(shots):
            fam, src = fams[i], "TIMELINE.md"
        elif round(a, 2) in kinds:
            fam = "hard cut" if kinds[round(a, 2)] == "cut" else "gradual seam (dissolve, morph, wipe or fast move)"
            src = "analyze.py boundary"
        else:
            fam, src = "hard cut (unchecked)", "analyze.py shot detection"
        out.append({"t": a, "family": fam, "hard": is_hard(fam), "source": src})
    return out


# ------------------------------------------------------------------ measured grammar

def luma_jump(rep, t):
    """Largest brightness change within 0.3 s either side of a hit (0 to 1), from analyze.py's 6 fps luma curve. A
    full-frame flip to an accent colour shows here even when no white flash frame is found."""
    lum = ((rep.get("structure") or {}).get("luma_6fps")) or []
    if not lum: return None
    i0, i1 = max(0, int((t - 0.3) * 6)), min(len(lum) - 1, int((t + 0.3) * 6) + 1)
    win = lum[i0:i1 + 1]
    return rnd(max(win) - min(win), 2) if len(win) > 1 else None


def tempo(rep, sm):
    """The beat grid the grammar is measured against: the sound map's tempo when it is confident (its tracker is the
    better one), re-gridded from the analyzer's first beat, else the analyzer's own beats. A disagreement is noted."""
    aud = rep.get("audio") or {}
    dur = (rep.get("video") or {}).get("duration") or 0
    m = (sm or {}).get("music") or {}
    a_bpm, s_bpm = aud.get("bpm"), m.get("tempo_bpm") if m.get("present") else None
    info = {"analyze_bpm": a_bpm, "sound_map_bpm": s_bpm}
    if sm and not (s_bpm and (m.get("tempo_confidence") or 0) >= 0.35):
        info.update(bpm="free time", source="sound map: no steady beat",
                    note=f"the sound map found no steady beat (tempo {m.get('tempo_bpm')} at confidence {m.get('tempo_confidence')}); "
                         f"analyze.py's {a_bpm} bpm is not used and beat-relative fields are unmeasured")
        return info, [], None
    if s_bpm and (m.get("tempo_confidence") or 0) >= 0.35:
        bs = 60 / s_bpm
        first = aud.get("first_beat") or 0.0
        first -= bs * int(first / bs)
        beats = [round(first + k * bs, 3) for k in range(int((dur - first) / bs) + 1)] if dur else []
        info.update(bpm=s_bpm, source="sound map", beat_seconds=round(bs, 4))
    else:
        beats, bs = aud.get("beats") or [], aud.get("beat_seconds")
        info.update(bpm=a_bpm, source="analyze.py" if a_bpm else "none", beat_seconds=bs)
    reads = [x for x in [a_bpm, s_bpm, *((aud.get("bpm_reads") or {}).values())] if isinstance(x, (int, float))]
    if reads:
        info["range_bpm"] = [round(min(reads), 1), round(max(reads), 1)]
    if a_bpm and s_bpm and abs(a_bpm - s_bpm) / s_bpm > 0.02:
        info["note"] = (f"analyze.py and the sound map disagree ({a_bpm} vs {s_bpm} bpm, more than 2 percent); the grammar uses "
                        f"{info['source']} (sound map when its confidence is 0.35 or more)")
        info["exact_tempo"] = unknown(f"a listen or a tap-along by the user: the reads span {info['range_bpm'][0]} to {info['range_bpm'][1]} bpm")
    return info, beats, bs


def structure_rows(rep, seam_rows):
    """The labelled seams plus the non-cut structure analyze.py finds (fades, black holds, overlays popping, revealing
    or scaling in), as one time-ordered list. This is the transition grammar of a one-take film."""
    st = rep.get("structure") or {}
    rows = [{"t": x["t"], "family": x["family"]} for x in seam_rows]
    rows += [{"t": f["start"], "end": f["end"], "family": f["kind"].replace("_", " ")} for f in st.get("fades") or []]
    for o in st.get("overlays") or []:
        fam = f"overlay {o['kind']}" + (" over black" if o.get("over") == "black" else "")
        rows.append({"t": o["start"], "end": o["end"], "family": fam, **({"region": o["region"]} if o.get("region") else {})})
    return sorted(rows, key=lambda r: r["t"]), "structure" in rep


def grammar(rep, notes, fams, peaks_file, sm=None, reasons=None, pace=None, depth_file=None, never=None):
    dur = (rep.get("video") or {}).get("duration")
    shots = rep.get("shots") or []
    lens = [b - a for a, b in shots]
    aud = rep.get("audio") or {}
    tinfo, beats, beat_s = tempo(rep, sm)
    sd = rep.get("shot_details") or []
    g = {"tempo": tinfo}

    if lens:
        buckets = [(0, 0.5), (0.5, 1), (1, 2), (2, 4), (4, 8), (8, 1e9)]
        g["shot_lengths"] = {
            "count": len(lens), "mean_s": rnd(statistics.mean(lens)), "shortest_s": rnd(min(lens)), "longest_s": rnd(max(lens)),
            "quantiles_s": quantiles(lens),
            "histogram_pct_of_shots": {(f"{a:g}-{b:g} s" if b < 1e8 else f"over {a:g} s"): pct(sum(1 for x in lens if a <= x < b) / len(lens)) for a, b in buckets},
            "mean_beats": rnd(statistics.mean(lens) / beat_s, 1) if beat_s else None,
        }
        if (rep.get("pacing") or {}).get("one_take"):
            g["shot_lengths"]["one_take"] = "no hard cut: the structure lives in camera moves, overlays and fades (see transitions)"
        elif not any(x["hard"] for x in seams(rep, fams)):
            g["shot_lengths"]["no_hard_cuts"] = "these are segments between gradual seams, not shots between cuts"
    else:
        g["shot_lengths"] = unknown("analyze.py shot detection (needs scenedetect from requirements.txt)")

    seam_rows = seams(rep, fams)
    cuts = [x["t"] for x in seam_rows if x["hard"]]
    if cuts and beats and beat_s:
        on, half = 0, 0
        for c in cuts:
            off = min(abs(c - b) for b in beats) / beat_s
            if off <= 0.125:
                on += 1
            elif abs(off - 0.5) <= 0.125:
                half += 1
        g["cuts_vs_beats"] = {"on_beat_pct": pct(on / len(cuts)), "on_half_beat_pct": pct(half / len(cuts)),
                              "free_pct": pct((len(cuts) - on - half) / len(cuts)), "tolerance": "one eighth of a beat"}
    elif cuts and tinfo.get("bpm") == "free time":
        g["cuts_vs_beats"] = "free time: no beat to measure against"
    elif cuts:
        g["cuts_vs_beats"] = unknown("analyze.py audio tempo and beats (needs librosa and a reference with music)")
    elif (rep.get("pacing") or {}).get("one_take") or seam_rows:
        g["cuts_vs_beats"] = "no hard cuts"
    else:
        g["cuts_vs_beats"] = unknown("analyze.py shot detection and beats")

    events, has_structure = structure_rows(rep, seam_rows)
    if beats and beat_s and events:
        on = sum(1 for e in events if min(abs(e["t"] - b) for b in beats) / beat_s <= 0.125)
        g["events_vs_beats"] = {"on_beat_pct": pct(on / len(events)), "events": len(events), "tolerance": "one eighth of a beat"}

    trans = {}
    for f in fams:
        trans[f] = trans.get(f, 0) + 1
    if not trans and events:
        for e in events:
            trans[e["family"]] = trans.get(e["family"], 0) + 1
    if trans:
        total = sum(trans.values())
        g["transitions"] = {"families_pct": {k: pct(v / total) for k, v in sorted(trans.items(), key=lambda kv: -kv[1])},
                            "seam_carry": notes.get("transitions") or unknown("Transitions line of the ANALYSIS.md Recipe notes, from 12 fps strips of each seam (clip_strip.py)")}
        if dur and fams and len(fams) == len(shots):
            g["transitions"]["timeline"] = [{"at_pct": pct(a / dur), "family": f} for (a, _), f in zip(shots, fams)]
        elif events and dur and not fams and not notes.get("transitions"):
            g["transitions"]["timeline"] = [{"at_pct": pct(e["t"] / dur), "family": e["family"]} for e in events]
        if (fams or notes.get("transitions")) and events and dur:   # the analyzer's labels stay, but only as evidence
            g["transitions"]["analyzer_evidence"] = [{"at_pct": pct(e["t"] / dur), "label": e["family"]} for e in events]
    elif notes.get("transitions"):
        g["transitions"] = {"families_pct": unknown("the transition in column of TIMELINE.md"), "seam_carry": notes["transitions"]}
    else:
        g["transitions"] = unknown("TIMELINE.md transition in column and the Transitions line of the Recipe notes (watching.md, clip_strip.py strips)")

    if sd:
        span = sum(max(0.01, x["end"] - x["start"]) for x in sd)
        kinds, paces, speeds = {}, {}, {}
        for x in sd:
            w = max(0.01, x["end"] - x["start"])
            cam = x.get("camera") or {}
            for sg in cam.get("segments") or [{"start": 0, "end": w, "kind": cam.get("kind") or ["static"], "speed": cam.get("speed") or 0}]:
                for k in sg["kind"]:   # time per kind from the camera segments, so one long take with several moves is split
                    kinds[k] = kinds.get(k, 0) + sg["end"] - sg["start"]
                    speeds.setdefault(k, []).append(sg["speed"])
            p = cam.get("pace", "still")
            paces[p] = paces.get(p, 0) + w
        segs = [sg for x in sd for sg in (x.get("camera") or {}).get("segments") or []]
        g["camera"] = {"kinds_time_pct": {k: pct(v / span) for k, v in sorted(kinds.items(), key=lambda kv: -kv[1])},
                       "pace_time_pct": {k: pct(v / span) for k, v in sorted(paces.items(), key=lambda kv: -kv[1])},
                       "median_speed_by_kind": {k: rnd(statistics.median(v), 3) for k, v in speeds.items()},
                       "speed_unit": "share of frame per second (analyze.py)"}
        if segs and dur:
            g["camera"]["timeline"] = [{"from_pct": pct(sg["start"] / dur), "to_pct": pct(sg["end"] / dur), "kind": "/".join(sg["kind"]), "speed": sg["speed"]} for sg in segs]
        still = paces.get("still", 0) / span
    else:
        g["camera"] = unknown("analyze.py per-shot optical flow (needs opencv-python-headless)")
        still = None

    flashes = rep.get("flashes") or []
    if dur and (cuts or sd or events):
        curve = []
        for i in range(10):
            a, b = dur * i / 10, dur * (i + 1) / 10
            row = {"from_pct": i * 10, "to_pct": (i + 1) * 10, "cuts_per_s": rnd(sum(1 for c in cuts if a <= c < b) / max(0.01, b - a))}
            segs = [sg for x in sd for sg in (x.get("camera") or {}).get("segments") or []] or \
                   [{"start": x["start"], "end": x["end"], "speed": x["camera"].get("speed") or 0} for x in sd]
            ov = [(sg, min(b, sg["end"]) - max(a, sg["start"])) for sg in segs if min(b, sg["end"]) > max(a, sg["start"])]
            if ov:
                row["camera_speed"] = rnd(sum((sg.get("speed") or 0) * w for sg, w in ov) / sum(w for _, w in ov), 3)
                if any("elements_move" in sg for sg, _ in ov):
                    row["elements_move_pct"] = pct(sum(w for sg, w in ov if sg.get("elements_move")) / sum(w for _, w in ov))
            row["flashes"] = sum(1 for f in flashes if a <= (f.get("t", f) if isinstance(f, dict) else f) < b)
            if has_structure:
                row["events"] = sum(1 for e in events if a <= e["t"] < b and e["family"] != "hard cut")
            curve.append(row)
        g["density_curve"] = curve
    else:
        g["density_curve"] = unknown("analyze.py shots, camera and flashes")
    ms = rep.get("stillness")
    if ms:
        g["stillness"] = {"ratio": ms["ratio"], "calm_ratio": ms.get("calm_ratio"), "calm_runs": [f"{a}-{b} s" for a, b in ms.get("calm_runs") or []], "content_area": ms.get("content_area"),
                          "raw_frame_ratio": ms.get("raw_frame_ratio"), "source": "analyze.py, on the content region against its noise floor"}
        if notes.get("stillness"): g["stillness"]["note"] = notes["stillness"]
    elif notes.get("stillness"):
        g["stillness"] = {"ratio": notes["stillness"], "source": "ANALYSIS.md Recipe notes (frame difference, measuring.md section 3)"}
    elif still is not None:
        g["stillness"] = {"camera_still_time_pct": pct(still), "source": "proxy from analyze.py camera pace; the frame-difference ratio of measuring.md section 3 is not measured"}
    else:
        g["stillness"] = unknown("frame difference ratio (measuring.md section 3) or analyze.py camera pace")

    tc = notes.get("text-card share") or notes.get("text card share")
    g["type"] = {"behaviour": notes.get("type behaviour") or notes.get("type behavior") or unknown("Type behaviour line of the Recipe notes: entrance, hold, exit, headline to body size ratio, from frames"),
                 "text_card_share": tc or unknown("text-card seconds over runtime (measuring.md section 3)")}
    g["cursor"] = notes.get("cursor") or "none noted (write the Cursor line of the Recipe notes when the reference shows a pointer)"
    g["composition"] = notes.get("composition") or unknown("Composition line of the Recipe notes: framing habit, negative space, hero scale (measuring.md section 3, element scale)")

    pk = None
    if isinstance(peaks_file, list) and peaks_file:
        pk, src = peaks_file, "peaks.json (confirmed)"
    elif isinstance(peaks_file, dict) and peaks_file.get("peaks"):
        pk, src = peaks_file["peaks"], "peaks.json (confirmed)"
    elif aud.get("peak_candidates"):
        pk, src = aud["peak_candidates"], "analyze.py peak candidates (unconfirmed: confirm on a 12 fps strip)"
    if pk and dur:
        rows = []
        for p in pk:
            p = p if isinstance(p, dict) else {"t": p}
            t = p.get("hit", p.get("t"))
            if t is None:
                continue
            shot = next((b - a for a, b in shots if a <= t < b), None)
            near_cut = min((abs(c - t) for c in cuts), default=None)   # hard cuts only
            near_flash = min((abs((f.get("t", 0) if isinstance(f, dict) else f) - t) for f in flashes), default=None)
            row = {"at_pct": pct(t / dur), "kind": p.get("kind") or p.get("id") or "peak", "rise": p.get("rise"),
                   "cut_on_hit": p["cut_on_hit"] if isinstance(p.get("cut_on_hit"), bool) else (near_cut is not None and near_cut <= 0.25), "flash_on_hit": near_flash is not None and near_flash <= 0.25,
                   "brightness_jump": luma_jump(rep, t), "shot_at_hit_s": rnd(shot)}
            if p.get("subject_fill") is not None:
                row["subject_fill"] = p["subject_fill"]
            if p.get("from") is not None and p.get("to") is not None:
                row["build_s"], row["after_s"] = rnd(t - p["from"]), rnd(p["to"] - t)
            for k in ("build", "hold", "hit_what", "after", "sound"):
                if p.get(k):
                    row[k] = p[k]
            rows.append(row)
        g["climax"] = {"source": src, "peaks": rows}
    else:
        g["climax"] = {"source": "none", "peaks": unknown("peaks.json (climax-duel.md) or analyze.py peak candidates (needs librosa)")}
    g["motif_and_rhyme"] = notes.get("motif and rhyme") or notes.get("motif") or unknown("Motif and rhyme line of the Recipe notes: recurring motif, how the ending rhymes with the opening")
    g["element_reasons"] = reasons if reasons is not None else element_reasons("")
    g["never"] = never if never is not None else never_rules("")
    g["pacing"] = pace if pace is not None else pacing(rep, notes, "")
    g["depth"] = depth_value(notes, depth_file)
    return g


def depth_value(notes, depth_file=None):
    """Depth, 3D and camera (lesson L12): the Depth line of the Recipe notes, with analysis/depth.json when it exists."""
    line = notes.get("depth")
    if isinstance(depth_file, dict):
        return {"line": line or "not written (the Depth line of the Recipe notes)", "measured": depth_file}
    return line or unknown("Depth line of the Recipe notes and analysis/depth.json: camera moving share, depth planes and parallax ratio, "
                           "push-throughs, 3D elements, depth of field, and the words that switch each on (measuring.md \"Depth, 3D and camera\"); write none when there is none")


# ------------------------------------------------------------------ look

def look(rep, notes, finish=None):
    sd = rep.get("shot_details") or []
    lo = {}
    if sd:
        n = len(sd)
        b = [x["look"]["brightness"] for x in sd]
        col = [x["look"]["colourfulness"] for x in sd]
        third = max(1, n // 3)
        mean_col = statistics.mean(col)
        lo["light_dark"] = {"low_key_shots_pct": pct(sum(1 for x in sd if x["look"]["dark_ratio"] > 0.5) / n),
                            "bright_shots_pct": pct(sum(1 for v in b if v >= 0.55) / n),
                            "mean_brightness": rnd(statistics.mean(b), 3), "mean_contrast": rnd(statistics.mean(x["look"]["contrast"] for x in sd), 3),
                            "brightness_arc": {"first_third": rnd(statistics.mean(b[:third]), 3), "last_third": rnd(statistics.mean(b[-third:]), 3)}}
        lo["saturation"] = {"mean_colourfulness": rnd(mean_col, 3),
                            "level": "low" if mean_col < 0.15 else "medium" if mean_col < 0.35 else "high",
                            "spread": rnd(max(col) - min(col), 3)}
        if rep.get("palette"):   # ground, text, accent and secondary tones with their shares of the picture
            lo["palette"] = [{"hex": c["hex"], "role": c["role"], "share_pct": round(100 * c["share"], 1)} for c in rep["palette"]]
            lo["palette_values"] = [c["hex"] for c in rep["palette"]]
        else:
            freq = {}
            for x in sd:
                for i, h in enumerate(x["look"].get("dominant") or []):
                    freq[h] = freq.get(h, 0) + (4 - i)
            lo["palette_values"] = [h for h, _ in sorted(freq.items(), key=lambda kv: -kv[1])[:6]]
    else:
        lo["light_dark"] = unknown("analyze.py per-shot look (needs opencv-python-headless)")
        lo["saturation"] = unknown("analyze.py per-shot look")
    lo["accent_rule"] = notes.get("accent rule") or unknown("Accent rule line of the Recipe notes: how many accent colours and where they appear, from frames")
    lo["material_and_light"] = notes.get("material and light") or unknown("Material and light line of the Recipe notes: material category, texture, light mood")
    lo["typefaces"] = notes.get("typefaces") or unknown("Typefaces line of the Recipe notes: headline and body typefaces seen, or the closest named match")
    lo["medium"] = notes.get("medium") or unknown("Medium line of ANALYSIS.md")
    lo["fixed_marks"] = notes.get("fixed marks") or unknown("Fixed marks line of the Recipe notes: each mark that stays on screen (logo, programme name, corner bug) "
                                                            "with box x and y percent, width percent, opacity, colour, first and last frame and layer (measuring.md \"Fixed marks\"); write none when there is none")
    lo["finishing"] = finish if finish is not None else finishing("")
    return lo


# ------------------------------------------------------------------ sound

def sound(rep, sm, cuts, dur, events=()):
    aud = rep.get("audio") or {}
    if not sm:
        out = {"sound_map": "no sound map", "measure_with": "ice-audio sound map (sound_map.json) for sections, instrumentation, SFX, voice and mix"}
        if aud.get("bpm"):
            out["tempo_bpm"] = aud["bpm"]
            out["first_beat_s"] = aud.get("first_beat")
        elif aud.get("present") is False:
            out["tempo_bpm"] = "no audio in the reference"
        else:
            out["tempo_bpm"] = unknown(aud.get("skipped") or aud.get("note") or "analyze.py audio (needs librosa)")
        return out
    dur = sm.get("duration_s") or dur
    m = sm.get("music") or {}
    out = {"sound_map": "present"}
    if m.get("present"):
        rel = lambda t: pct(t / dur) if dur else None
        a_bpm = (rep.get("audio") or {}).get("bpm")
        out["music"] = {"tempo_bpm": m.get("tempo_bpm"), "tempo_confidence": m.get("tempo_confidence"), "analyze_bpm": a_bpm,
                        **({"tempo_note": f"analyze.py measured {a_bpm} bpm; the sound map's tempo is used"} if a_bpm and m.get("tempo_bpm") and abs(a_bpm - m["tempo_bpm"]) > 1 else {}),
                        "key": key_value(m, sm),
                        "sections": [{"from_pct": rel(s["start"]), "to_pct": rel(s["end"]), "label": s.get("label"), "energy": s.get("energy")} for s in m.get("sections") or []],
                        "energy_curve": tenths(m.get("energy_curve") or [], dur),
                        "instrumentation": guesses(m.get("instrumentation_guess"), "instrumentation"),
                        "genre": guesses(m.get("genre_guess"), "genre")}
    else:
        out["music"] = {"detected": False, "genre_and_instrumentation": unknown("a listen by the user (no steady music bed was detected; there may still be music)")}
    sfx = sm.get("sfx") or []
    beat_s = 60 / m["tempo_bpm"] if m.get("tempo_bpm") else None
    beats = (rep.get("audio") or {}).get("beats") or []
    if sfx:
        by = {}
        for s in sfx:
            by.setdefault(s.get("type") or "other", []).append(s)
        rows = {}
        for k, items in sorted(by.items(), key=lambda kv: -len(kv[1])):
            marks = cuts or [e["t"] for e in events]   # a one-take film: overlays and fades are its seams
            offs = [s["t"] - min(marks, key=lambda c: abs(c - s["t"])) for s in items] if marks else []
            on_cut = sum(1 for o in offs if abs(o) <= 0.1)
            row = {"count": len(items), "per_min": rnd(60 * len(items) / dur, 1) if dur else None,
                   ("on_cut_pct" if cuts else "on_overlay_or_fade_pct"): pct(on_cut / len(items)) if marks else unknown("shot cuts or structure events from analyze.py"),
                   "median_offset_to_cut_s": rnd(statistics.median(offs)) if offs else None,
                   "median_peak_db": rnd(statistics.median([s.get("peak_db", 0) for s in items]), 1),
                   "median_confidence": rnd(statistics.median([s.get("confidence", 0) for s in items]))}
            if beats and beat_s:
                row["on_beat_pct"] = pct(sum(1 for s in items if min(abs(s["t"] - b) for b in beats) <= beat_s / 8) / len(items))
            rows[k] = row
        out["sfx"] = {"by_type": rows, "offset_sign": "negative = before the cut or event (lead), positive = after it",
                      "types": "proposed by the sound map from the waveform; confirm by ear"}
    else:
        out["sfx"] = "no SFX detected"
    v = sm.get("voice") or {}
    if v.get("present"):
        talk = sum(max(0, s["end"] - s["start"]) for s in v.get("segments") or [])
        out["voice"] = {"detected": True, "time_pct": pct(talk / dur) if dur else None,
                        "speech_or_singing": unknown("a listen by the user (the sound map detects a voice, not what it is)")}
        if dur and talk / dur > 0.85 and len(v.get("segments") or []) <= 2:
            out["voice"]["note"] = "one unbroken voice segment over 85 percent of the runtime is more likely a vocal line in the music track than a voiceover"
    else:
        out["voice"] = {"detected": False}
    mx = sm.get("mix") or {}
    out["mix"] = {"integrated_lufs": mx.get("integrated_lufs"), "true_peak_dbtp": mx.get("true_peak_dbtp"), "lra": mx.get("lra")}
    if sm.get("notes"):
        out["notes"] = sm["notes"]
    return out


def key_value(m, sm):
    """The sound map's key, or unknown when its margin over the next key is under 0.05 (the map writes that in notes)."""
    key = " ".join(x for x in (m.get("key"), m.get("mode")) if x)
    margin = next((float(x) for n in sm.get("notes") or [] for x in re.findall(r"margin over the next key ([0-9]+(?:\.[0-9]+)?)", n)), None)
    if not key:
        return unknown("a listen by the user (the sound map found no key)")
    if margin is not None and margin < 0.05:
        return unknown(f"a listen by the user: the sound map's best key is {key}, but its margin over the next key is {margin:.2f}")
    return key


def guesses(items, what):
    """A sound map guess is a proposal, not a fact: it stays unknown until a listen confirms it."""
    if not items:
        return unknown(f"a listen by the user ({what}: the sound map proposed nothing)")
    top = sorted(items, key=lambda x: -(x.get("confidence") or 0))[:3]
    return unknown(f"a listen by the user to confirm the sound map's proposals for {what}: " + ", ".join(f"{x.get('name')} ({rnd(x.get('confidence'))})" for x in top))


def tenths(curve, dur):
    if not curve or not dur:
        return unknown("sound map energy curve")
    out = []
    for i in range(10):
        a, b = dur * i / 10, dur * (i + 1) / 10
        pts = [p["rms_db"] for p in curve if a <= p["t"] < b]
        out.append({"from_pct": i * 10, "rms_db": rnd(statistics.mean(pts), 1) if pts else None})
    return out


# ------------------------------------------------------------------ feeling, slots, scaling, prompt

def feeling(notes, g, dur):
    markers = []
    pk = (g.get("climax") or {}).get("peaks")
    if isinstance(pk, list):
        markers += [f"{p['at_pct']}%: {p.get('kind') or 'peak'}" + (f" (sound rise {p['rise']})" if p.get("rise") is not None else "")
                    + (f" (brightness jump {p['brightness_jump']})" if p.get("brightness_jump") else "") for p in pk]
    dc = g.get("density_curve")
    if isinstance(dc, list) and dc:
        if any(r["cuts_per_s"] for r in dc):
            busiest = max(dc, key=lambda r: r["cuts_per_s"]); calmest = min(dc, key=lambda r: r["cuts_per_s"])
            markers.append(f"{busiest['from_pct']}-{busiest['to_pct']}%: densest cutting ({busiest['cuts_per_s']} cuts/s)")
            markers.append(f"{calmest['from_pct']}-{calmest['to_pct']}%: calmest stretch ({calmest['cuts_per_s']} cuts/s)")
        else:   # no hard cuts: rank the tenths by motion (camera, elements) and overlays instead
            motion = lambda r: (r.get("camera_speed") or 0) + (r.get("elements_move_pct") or 0) / 1000 + (r.get("events") or 0) / 100
            busiest = max(dc, key=motion); calmest = min(dc, key=motion)
            markers.append(f"{busiest['from_pct']}-{busiest['to_pct']}%: busiest stretch (camera speed {busiest.get('camera_speed', 0)}, "
                           f"elements moving {busiest.get('elements_move_pct', 0)} percent of it)")
            runs = (g.get("stillness") or {}).get("calm_runs") if isinstance(g.get("stillness"), dict) else None
            if runs:   # the content-region stillness finds the calm stretches better than a tenth of the runtime
                markers.append(f"{runs[0]}: longest calm stretch (only a small element moves, or nothing)")
            else:
                markers.append(f"{calmest['from_pct']}-{calmest['to_pct']}%: calmest stretch (camera speed {calmest.get('camera_speed', 0)}, "
                               f"elements moving {calmest.get('elements_move_pct', 0)} percent of it)")
        if all("events" in r for r in dc) and any(r["events"] for r in dc):
            ev = max(dc, key=lambda r: r["events"])
            markers.append(f"{ev['from_pct']}-{ev['to_pct']}%: most overlays and fades ({ev['events']})")
    tl = (g.get("transitions") or {}).get("timeline") if isinstance(g.get("transitions"), dict) else None
    markers += [f"{e['at_pct']}%: {e['family']}" for e in tl or [] if e["family"].startswith(("fade", "cut to black", "overlay scale-in"))]
    arc = notes.get("feeling") or notes.get("emotion arc") or unknown("Feeling line of the Recipe notes, written after the whole-piece watch: the feeling over time, each tied to the timestamp that causes it")
    return {"arc": arc, "measured_markers": markers}


def scaling(rep, g):
    dur = (rep.get("video") or {}).get("duration")
    sl = g.get("shot_lengths")
    mean = sl.get("mean_s") if isinstance(sl, dict) and not is_unknown(sl) else None
    pk = (g.get("climax") or {}).get("peaks")
    npk = len(pk) if isinstance(pk, list) else 0
    rules = ["Positions (sections, peaks, density curve) are kept as shares of the runtime.",
             "Shot lengths are kept in beats when there is music, otherwise in seconds; the shot count scales with the length.",
             "The held breath and the hold after each hit keep their seconds; only the build stretches or shrinks.",
             "Below three quarters of the reference length keep the main peak only; above twice the length repeat the section structure, never stretch a shot past the reference's longest.",
             "A new aspect ratio keeps the composition habit and re-frames each shot; a new language keeps the type behaviour and re-sets every line."]
    table = []
    if mean and dur:
        for L in (6, 15, 30, 60):
            table.append({"length_s": L, "shots_about": max(1, round(L / mean)), "peaks": min(npk, 1) if L < 0.75 * dur else npk})
    return {"reference_length_s": rnd(dur), "rules": rules, "derived_examples": table or unknown("shot lengths and duration from analyze.py")}


def prompt_block(ref_id, rel_path, mode, slots, content_type="unknown"):
    open_slots = [s for s in SLOTS if not slots.get(s)]
    lines = [f"Use Ice Motion Director with the style recipe {rel_path} (reference {ref_id}; machine twin style-recipe.json in the same folder).",
             f"Mode: {mode}. {RIGHTS_LINE}",
             "Recreate its whole style, skin included unless I give a brand.",
             "Its own media, placed as they are or recreated as the identity slot says: " + "; ".join(OWN_MEDIA) + ".",
             f"If I did not say which, ask the {IDENTITY}.",
             f"For {PEOPLE}.",
             f"Reference content type: {content_type}. If my piece is a different type, recommend the same editing principles with my identity or my real brand's, not the reference's identity (ice-remake references/rights-and-modes.md section 1, The identity fits the content).",
             "Carry an element of the reference only where my script holds the same trigger kind as its element reason, and cut an element with no reason; apply each finishing effect only where its measured row says.",
             "Keep its pacing (no gap longer than its longest gap, at least its events per minute), place a mark in each of its fixed-mark slots (its own or mine, as the identity slot says), "
             "and carry its depth, 3D and camera movement with a build route for each (ice-remake references/measuring.md, \"Pacing events\", \"Fixed marks\" and \"Depth, 3D and camera\")."]
    lines.append("If content is footage, edit my footage with this recipe as the style reference; if it is from-scratch, build a new piece in this style.")
    lines.append("Slots:")
    for s in SLOTS:
        lines.append(f"- {s}: {slots[s]}" if slots.get(s) else f"- {s}: OPEN ({SLOT_HELP[s]})")
    if open_slots:
        lines.append("Open slots: " + ", ".join(open_slots) + ".")
        lines.append("Before any concept work, run the stage 01 research, then ask me about every open slot: exactly four options each, built from my brief and the research, the recommended one first with a one-line reason, and room for my own answer. Do not ask about slots I filled.")
    else:
        lines.append("Open slots: none. Run the stage 01 research and ask about any other open decision the four-choice way.")
    return "\n".join(lines), open_slots


# ------------------------------------------------------------------ Markdown

def fmt(v):
    if is_unknown(v):
        return f"unknown (measure with: {v['measure_with']})"
    if isinstance(v, dict):
        return "; ".join(f"{k}: {fmt(x)}" for k, x in v.items())
    if isinstance(v, list):
        return ", ".join(fmt(x) for x in v) if v else "none"
    if isinstance(v, bool):
        return "yes" if v else "no"
    return "not measured" if v is None else str(v)


def md_rows(rows):
    """A list of row dicts as a Markdown table, every cell through fmt."""
    cols = []
    for r in rows:
        cols += [k for k in r if k not in cols]
    return (["| " + " | ".join(c.replace("_", " ") for c in cols) + " |", "|" + "---|" * len(cols)]
            + ["| " + " | ".join(fmt(r.get(c, "")).replace("|", "/") for c in cols) + " |" for r in rows])


def markdown(r):
    h, g, lo, so, fe, sc = r["header"], r["grammar"], r["look"], r["sound"], r["feeling"], r["scaling"]
    L = [f"# Style recipe: {r['ref_id']}", "",
         f"Made {r['made']} by recipe.py from measured files. Format: ice-remake references/style-recipe.md. Every number is measured; \"unknown\" names what would measure it.", "",
         "## 1. Header", "",
         f"- Reference: {h['kind']}, {fmt(h['medium'])}, {fmt(h['duration_s'])} s, aspect {fmt(h['aspect'])}",
         f"- Content type: {fmt(h['content_type'])}",
         *([f"- Orientation: {h['orientation']}"] if h.get("orientation") else []),
         *([f"- Caveats: {h['caveats']}"] if h.get("caveats") else []),
         f"- Mode: {h['mode']}   {h['rights']}",
         "- Taken: " + "; ".join(h["taken"]),
         "- Its own media, placed as they are or recreated (identity slot): " + "; ".join(h["own_media"]),
         f"- {h['people'][0].upper()}{h['people'][1:]}", "",
         "## 2. Measured grammar", ""]
    for k, label in (("tempo", "Tempo grid"), ("shot_lengths", "Shot lengths"), ("cuts_vs_beats", "Cuts against beats"),
                     ("events_vs_beats", "Structure events against beats"), ("transitions", "Transitions and seams"),
                     ("camera", "Camera moves and speeds"), ("stillness", "Stillness"), ("type", "Type behaviour"),
                     ("cursor", "Cursor"), ("composition", "Composition habits"), ("motif_and_rhyme", "Motif and rhyme"),
                     ("pacing", "Pacing events"), ("depth", "Depth, 3D and camera"), ("never", "Never (counts of 0 in REASONS.md)")):
        if k in g:
            L.append(f"- {label}: {fmt(g[k])}")
    dc = g["density_curve"]
    L += ["", "Density curve (tenths of the runtime):", ""]
    if isinstance(dc, list):
        L += ["| % of runtime | cuts/s | camera speed | elements moving % | flashes | overlays and fades |", "|---|---|---|---|---|---|"]
        L += [f"| {x['from_pct']}-{x['to_pct']} | {x['cuts_per_s']} | {fmt(x.get('camera_speed'))} | {fmt(x.get('elements_move_pct'))} | {x['flashes']} | {fmt(x.get('events'))} |" for x in dc]
    else:
        L.append(fmt(dc))
    cl = g["climax"]
    L += ["", f"Climax anatomy (source: {cl['source']}):", ""]
    if isinstance(cl["peaks"], list):
        L += ["| at % | peak | sound rise | cut on hit | white flash on hit | brightness jump (0-1) | shot at hit s |", "|---|---|---|---|---|---|---|"]
        L += [f"| {p['at_pct']} | {fmt(p['kind'])} | {fmt(p['rise'])} | {fmt(p['cut_on_hit'])} | {fmt(p['flash_on_hit'])} | {fmt(p.get('brightness_jump'))} | {fmt(p['shot_at_hit_s'])} |" for p in cl["peaks"]]
        for i, p in enumerate(cl["peaks"], 1):
            parts = [f"{k.replace('_', ' ')}: {p[k]}" for k in ("build_s", "build", "hold", "hit_what", "after_s", "after", "sound") if k in p]
            L.append(f"- Peak {i} anatomy: " + ("; ".join(parts) if parts else "unknown (measure with: confirmed peaks.json from a 12 fps strip around the hit, climax-duel.md section 1)"))
    else:
        L.append(fmt(cl["peaks"]))
    er = g.get("element_reasons")
    L += ["", "Element reasons (REASONS.md; an element carries over only where the new script holds the same trigger kind, else it is cut):", ""]
    L += md_rows(er) if isinstance(er, list) else [fmt(er)]
    L += ["", "## 3. Look", ""] + [f"- {k.replace('_', ' ')}: {fmt(v)}" for k, v in lo.items() if k != "finishing"]
    fin = lo.get("finishing")
    L += ["", "Finishing layer (measuring.md section 9; applied only where its where and why hold, never on everything):", ""]
    L += md_rows(fin) if isinstance(fin, list) else [fmt(fin)]
    L += ["", "## 4. Sound", ""] + [f"- {k.replace('_', ' ')}: {fmt(v)}" for k, v in so.items()]
    L += ["", "## 5. Feeling", "", f"- Arc: {fmt(fe['arc'])}", "- Measured markers: " + ("; ".join(fe["measured_markers"]) or "none")]
    L += ["", "## 6. Slots", ""] + [f"- {s}: {r['slots'][s] or 'OPEN'} ({SLOT_HELP[s]})" for s in SLOTS]
    L += ["", "Scaling to a new length:", ""] + [f"- {x}" for x in sc["rules"]]
    ex = sc["derived_examples"]
    if isinstance(ex, list):
        L += ["", "| length s | shots about | peaks |", "|---|---|---|"] + [f"| {x['length_s']} | {x['shots_about']} | {x['peaks']} |" for x in ex]
    else:
        L.append(fmt(ex))
    L += ["", "## 7. Prompt block", "", "Paste this into Claude with Ice installed, with this folder attached or in the working folder:", "", "```text", r["prompt"], "```", "",
          "## Unknowns", ""] + ([f"- {u['field']}: measure with {u['measure_with']}" for u in r["unknowns"]] or ["- none"])
    return "\n".join(L) + "\n"


def collect_unknowns(node, path=""):
    out = []
    if is_unknown(node):
        return [{"field": path, "measure_with": node["measure_with"]}]
    if isinstance(node, dict):
        for k, v in node.items():
            out += collect_unknowns(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            out += collect_unknowns(v, f"{path}[{i}]")
    return out


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Write STYLE-RECIPE.md and style-recipe.json from a measured reference (local files only).")
    ap.add_argument("--ref", required=True, help="the reference folder: <ice>/reference/<ref-id>")
    ap.add_argument("--brief", help="the BRIEF.md with the References block (default: <ref>/../../BRIEF.md)")
    ap.add_argument("--sound-map", help="sound_map.json (default: <ref>/sound_map.json, then <ref>/analysis/sound_map.json)")
    ap.add_argument("--mode", help="overrides the brief: " + ", ".join(MODES))
    ap.add_argument("--kind", help="reference kind (video, site, image-set); overrides the brief")
    ap.add_argument("--slot", action="append", default=[], help="pre-fill a slot: name=value (names: " + ", ".join(SLOTS) + ")")
    ap.add_argument("--date", help="date written in the recipe (default: today)")
    ap.add_argument("--dry-run", action="store_true", help="write nothing; print the watch line and the unknowns (use during stage 01)")
    ap.add_argument("--events", action="store_true", help="write only <ref>/analysis/events.json (pacing events: report.json plus the "
                    "TIMELINE.md Events table) and print its longest gap and events per minute (stage 01, measuring.md \"Pacing events\")")
    a = ap.parse_args()

    ref = os.path.abspath(a.ref)
    ref_id = os.path.basename(ref.rstrip("\\/"))
    rep = load_json(os.path.join(ref, "analysis", "report.json"))
    if rep is None:
        sys.exit(f"recipe.py: {os.path.join(ref, 'analysis', 'report.json')} is missing. Run analyze.py first (references/measuring.md section 1).")
    timeline = read_text(os.path.join(ref, "TIMELINE.md"))
    if a.events:
        ev = pacing_events(rep, timeline)
        if not ev:
            sys.exit("recipe.py: report.json has no video duration, so no events file can be written (run analyze.py again).")
        path = os.path.join(ref, "analysis", "events.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(ev, f, ensure_ascii=False, indent=1)
        print(f"events  {path}")
        print(f"pacing  {len(ev['events'])} rows | longest gap {ev['longest_gap']} s at {ev['longest_gap_at'][0]}-{ev['longest_gap_at'][1]} s | "
              f"{ev['events_per_minute']} events per minute (holds excluded)")
        return
    brief = brief_line(read_text(a.brief or os.path.join(ref, os.pardir, os.pardir, "BRIEF.md")), ref_id)
    mode = (a.mode or brief.get("mode") or "structural fidelity").lower()
    if mode not in MODES:
        mode = "structural fidelity"
    slots = {s: "" for s in SLOTS}
    for kv in a.slot:
        k, _, v = kv.partition("=")
        k = k.strip().replace("-", "_")
        if k not in slots:
            sys.exit(f"recipe.py: unknown slot {k!r}; slots are {', '.join(SLOTS)}")
        slots[k] = v.strip()

    notes = recipe_notes(read_text(os.path.join(ref, "ANALYSIS.md")))
    trans = timeline_transitions(timeline)
    reasons_text = read_text(os.path.join(ref, "REASONS.md"))
    reasons = element_reasons(reasons_text)
    finish = finishing(read_text(os.path.join(ref, "ANALYSIS.md")))
    peaks = load_json(os.path.join(ref, "peaks.json"))
    sm_path = a.sound_map or next((p for p in (os.path.join(ref, "sound_map.json"), os.path.join(ref, "analysis", "sound_map.json")) if os.path.isfile(p)), None)
    sm = load_json(sm_path)

    v = rep.get("video") or {}
    pic = rep.get("picture") or {}
    w, hgt = pic.get("width") or v.get("width"), pic.get("height") or v.get("height")   # the real picture, never the analysis crop
    pace = pacing(rep, notes, timeline, load_json(os.path.join(ref, "analysis", "events.json")))
    g = grammar(rep, notes, trans, peaks, sm, reasons, pace, load_json(os.path.join(ref, "analysis", "depth.json")), never_rules(reasons_text))
    cuts = [x["t"] for x in seams(rep, trans) if x["hard"]]
    r = {"version": RECIPE_VERSION, "ref_id": ref_id, "made": a.date or datetime.date.today().isoformat(),
         "header": {"kind": a.kind or brief.get("kind") or "video", "medium": notes.get("medium") or unknown("Medium line of ANALYSIS.md"),
                    "content_type": notes.get("content type") or unknown("Content type line of the Recipe notes: what kind of piece the reference is (rights-and-modes.md section 1)"),
                    "duration_s": rnd(v.get("duration")) if v.get("duration") else unknown("analyze.py (ffprobe)"),
                    "aspect": notes.get("aspect") or (f"{w}:{hgt} ({rnd(w / hgt)})" if w and hgt else unknown("analyze.py video size")),
                    **({"orientation": notes.get("orientation") or (rep.get("orientation") or {}).get("note")} if notes.get("orientation") or (rep.get("orientation") or {}).get("rotated") else {}),
                    **({"caveats": notes["caveats"]} if notes.get("caveats") else {}),
                    "rights": RIGHTS_LINE, "mode": mode, "taken": TAKEN, "own_media": OWN_MEDIA, "identity": IDENTITY, "people": PEOPLE},
         "grammar": g, "look": look(rep, notes, finish), "sound": sound(rep, sm, cuts, v.get("duration"), structure_rows(rep, seams(rep, trans))[0]),
         "feeling": feeling(notes, g, v.get("duration")), "slots": slots, "scaling": scaling(rep, g)}
    rel_path = f"ice/reference/{ref_id}/STYLE-RECIPE.md"
    ct = r["header"]["content_type"]
    r["prompt"], r["open_slots"] = prompt_block(ref_id, rel_path, mode, slots, "unknown" if is_unknown(ct) else ct)
    r["unknowns"] = collect_unknowns({k: r[k] for k in ("header", "grammar", "look", "sound", "feeling", "scaling")})
    watch = [u["field"] for u in r["unknowns"] if any(w in u["measure_with"] for w in ("Recipe notes", "ANALYSIS.md", "REASONS.md"))]
    if a.dry_run:
        print("dry run: nothing written")
        print("watch   " + (", ".join(watch) if watch else "none: every watch field is filled"))
        print("unknown " + (", ".join(u["field"] for u in r["unknowns"]) or "none"))
        return
    with open(os.path.join(ref, "style-recipe.json"), "w", encoding="utf-8") as f:
        json.dump(r, f, ensure_ascii=False, indent=1)
    with open(os.path.join(ref, "STYLE-RECIPE.md"), "w", encoding="utf-8", newline="\n") as f:
        f.write(markdown(r))
    print(f"recipe  {os.path.join(ref, 'STYLE-RECIPE.md')}")
    print(f"twin    {os.path.join(ref, 'style-recipe.json')}")
    if watch:
        print("watch   these fields need the whole-piece watch and the Recipe notes lines of ANALYSIS.md, then run this again: " + ", ".join(watch))
    print(f"mode    {mode} | sound map {'yes' if sm else 'no'} | unknowns {len(r['unknowns'])} | open slots {', '.join(r['open_slots']) or 'none'}")


if __name__ == "__main__":
    main()
