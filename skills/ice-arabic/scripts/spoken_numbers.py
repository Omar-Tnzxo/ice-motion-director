#!/usr/bin/env python3
"""Arabic numbers as spoken words for a voiceover's spoken side (Ice Motion Director, ice-arabic).

A voice engine reads digits in the variety it guesses, not the film's: in a measured test (2026-11-01) an Egyptian
voice read "100.000" as MSA "مائة ألف" inside an Egyptian line, and "مية ألف" written as words as Egyptian.
So the spoken side of every Arabic line carries numbers as words in the film's variety (founder rule, 2026-11-01:
"الارقام تتكتب عربي زي 100.000 تتكتب مية الف"); the screen keeps digits.

Commands:
  convert --variety egyptian|msa TEXT    print TEXT with every number written as words
  check FILE                             fail (exit 1) when a spoken field in a voice lines file still has digits

Separators follow the Egyptian habit and are read by shape: a dot or comma followed by groups of exactly three digits
groups thousands (100.000, 1,250,000); any other dot or comma is a decimal mark (2,5 and 3.75). Arabic-Indic digits
are read too. A percent sign becomes "في المية" (Egyptian) or "بالمئة" (MSA).

MSA output is plain words in the nominative with the counted noun's number agreement (ثلاثة آلاف، أحد عشر ألفًا،
مئة ألف); full tashkeel and case endings depend on the sentence, so the agent marks them per line and the native
reader signs off (ice-arabic references/voice-arabic.md). Stdlib only, Python 3.10 or newer.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")
DIGIT_RE = re.compile(r"[0-9٠-٩۰-۹]")
NUMBER_RE = re.compile(r"(?<![A-Za-z0-9_.,])([0-9]+(?:[.,][0-9]+)*)(\s?%)?")

EG = {
    "units": ["صفر", "واحد", "اتنين", "تلاتة", "أربعة", "خمسة", "ستة", "سبعة", "تمانية", "تسعة", "عشرة",
              "حداشر", "اتناشر", "تلاتاشر", "أربعتاشر", "خمستاشر", "ستاشر", "سبعتاشر", "تمنتاشر", "تسعتاشر"],
    "tens": ["", "", "عشرين", "تلاتين", "أربعين", "خمسين", "ستين", "سبعين", "تمانين", "تسعين"],
    "hundreds": ["", "مية", "ميتين", "تلتمية", "ربعمية", "خمسمية", "ستمية", "سبعمية", "تمنمية", "تسعمية"],
    # count words before "thousand" for 3 to 10 drop the final taa: تلات تلاف
    "small_count": ["", "", "", "تلات", "أربع", "خمس", "ست", "سبع", "تمن", "تسع", "عشر"],
    "scales": [("ألف", "ألفين", "تلاف", "ألف"), ("مليون", "مليونين", "مليون", "مليون"),
               ("مليار", "مليارين", "مليار", "مليار")],
    "and": " و", "percent": "في المية", "point": "فاصلة", "half": "ونص", "quarter": "وربع",
}

MSA = {
    "units": ["صفر", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة",
              "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر",
              "تسعة عشر"],
    "tens": ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"],
    "hundreds": ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"],
    "small_count": None,
    # (one, two, 3 to 10 plural, 11 to 99 singular accusative, 100 and up singular genitive)
    "scales": [("ألف", "ألفان", "آلاف", "ألفًا", "ألف"), ("مليون", "مليونان", "ملايين", "مليونًا", "مليون"),
               ("مليار", "ملياران", "مليارات", "مليارًا", "مليار")],
    "and": " و", "percent": "بالمئة", "point": "فاصلة", "half": None, "quarter": None,
}

VARIETIES = {"egyptian": EG, "msa": MSA}


def below_thousand(n: int, t: dict) -> str:
    """0 < n < 1000 as words."""
    parts = []
    h, rest = divmod(n, 100)
    if h:
        parts.append(t["hundreds"][h])
    if rest:
        if rest < 20:
            parts.append(t["units"][rest])
        else:
            tens, unit = divmod(rest, 10)
            parts.append(f"{t['units'][unit]}{t['and']}{t['tens'][tens]}" if unit else t["tens"][tens])
    return t["and"].join(parts)


def scaled(count: int, scale: tuple, t: dict, variety: str) -> str:
    """count (1 to 999) of a scale word (thousand, million, billion) with its agreement."""
    if count == 1:
        return scale[0]
    if count == 2:
        return scale[1]
    if variety == "egyptian":
        if 3 <= count <= 10:
            if scale[0] == "ألف":
                return f"{t['small_count'][count]} {scale[2]}"
            return f"{t['units'][count]} {scale[2]}"
        return f"{below_thousand(count, t)} {scale[3]}"
    if 3 <= count <= 10:
        return f"{t['units'][count]} {scale[2]}"
    if count % 100 in range(11, 100):
        return f"{below_thousand(count, t)} {scale[3]}"
    return f"{below_thousand(count, t)} {scale[4]}"


def integer_words(n: int, variety: str) -> str:
    t = VARIETIES[variety]
    if n == 0:
        return t["units"][0]
    groups = []
    while n:
        n, g = divmod(n, 1000)
        groups.append(g)
    parts = []
    for i in range(len(groups) - 1, 0, -1):
        if groups[i]:
            parts.append(scaled(groups[i], t["scales"][i - 1], t, variety))
    if groups[0]:
        parts.append(below_thousand(groups[0], t))
    return t["and"].join(parts)


def parse_number(raw: str) -> tuple[int, str]:
    """Return (integer part, decimal digits) from a number written with Egyptian or Western separators."""
    s = raw.translate(AR_DIGITS)
    parts = re.split(r"[.,]", s)
    seps = re.findall(r"[.,]", s)
    if len(parts) > 1 and all(len(p) == 3 for p in parts[1:]) and len(parts[0]) <= 3 and (len(set(seps)) == 1):
        return int("".join(parts)), ""
    if len(parts) > 2 and all(len(p) == 3 for p in parts[1:-1]):
        return int("".join(parts[:-1])), parts[-1]
    if len(parts) == 2:
        return int(parts[0]), parts[1]
    return int("".join(parts)), ""


def number_words(raw: str, variety: str, percent: bool = False) -> str:
    t = VARIETIES[variety]
    whole, dec = parse_number(raw)
    words = integer_words(whole, variety)
    if dec:
        if variety == "egyptian" and dec.rstrip("0") == "5":
            words += f" {t['half']}"
        elif variety == "egyptian" and dec == "25":
            words += f" {t['quarter']}"
        else:
            words += f" {t['point']} " + " ".join(t["units"][int(d)] for d in dec)
    if percent:
        words += f" {t['percent']}"
    return words


def convert(text: str, variety: str) -> str:
    text = text.translate(AR_DIGITS)
    return NUMBER_RE.sub(lambda m: number_words(m.group(1), variety, bool(m.group(2))), text)


def check(path: Path) -> list[str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    problems = []
    for line in data.get("lines", []):
        spoken = str(line.get("spoken", ""))
        if DIGIT_RE.search(spoken):
            problems.append(f"line {line.get('id', '?')}: the spoken side still has digits ({spoken!r}); "
                            f"write numbers as words in the film's variety (spoken_numbers.py convert)")
    return problems


def main(argv: list[str] | None = None) -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("convert", help="write every number in TEXT as words")
    c.add_argument("--variety", choices=sorted(VARIETIES), required=True)
    c.add_argument("text")
    k = sub.add_parser("check", help="fail when a spoken field in a voice lines file has digits")
    k.add_argument("file", type=Path)
    a = ap.parse_args(argv)
    if a.cmd == "convert":
        print(convert(a.text, a.variety))
        return 0
    problems = check(a.file)
    for p in problems:
        print(p)
    print("PASS" if not problems else f"FAIL: {len(problems)} line(s) with digits on the spoken side")
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
