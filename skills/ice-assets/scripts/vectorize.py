"""Vectorize a raster into a layered SVG: one named group per colour region, back to front.

Usage:
    python vectorize.py <image.png|jpg> [-o out.svg] [--merge 24] [--speckle 4] [--precision 6]
                        [--mode spline|polygon] [--prefix region]

Works on Windows, macOS and Linux. Needs vtracer==0.6.15 (requirements.txt next to this file; it is MIT
licensed, by visioncortex). The image is traced in colour with cut-out shapes (no shape lies on top of
another), the fills are merged into colour regions (RGB distance up to --merge), and each region becomes
<g id="<prefix>-NN" data-color="#rrggbb" data-paths="n">, largest region first. Prints JSON: the SVG path
and one line per group.

Rung 3 of the ladder of art sources (references/sourcing-and-licenses.md section 1b): AI art only when the
user started it, then this step. An auto-traced image moves as one piece: its groups are colour regions,
not parts, so limbs cannot be animated separately until the parts are rebuilt as their own named groups
with pivots (the ice-styles skill, references/code-illustration-craft.md section 6).
"""
import argparse, json, os, re, sys, tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

REQUIREMENTS = Path(__file__).resolve().parent / "requirements.txt"
SVG_NS = "http://www.w3.org/2000/svg"
NOTE = ("Auto-traced: groups are colour regions, not parts. The drawing moves as one piece until each moving part "
        "is rebuilt as its own named group with a pivot.")


def hex_rgb(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) if re.fullmatch(r"[0-9a-fA-F]{6}", h) else None


def path_area(d):
    """Bounding-box area of a path's points: a cheap size used only to order the regions."""
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?", d or "")]
    xs, ys = nums[0::2], nums[1::2]
    if not xs or not ys:
        return 0.0
    return (max(xs) - min(xs)) * (max(ys) - min(ys))


def trace(vtracer, src, mode, speckle, precision):
    fd, tmp = tempfile.mkstemp(suffix=".svg")
    os.close(fd)
    try:
        vtracer.convert_image_to_svg_py(str(src), tmp, colormode="color", hierarchical="cutout", mode=mode,
                                        filter_speckle=speckle, color_precision=precision)
        return ET.parse(tmp).getroot()
    finally:
        os.remove(tmp)


def layered(root, merge, prefix):
    paths = []
    for p in root.iter(f"{{{SVG_NS}}}path"):
        rgb = hex_rgb(p.get("fill", ""))
        if rgb is None:
            continue
        paths.append({"el": p, "rgb": rgb, "area": path_area(p.get("d"))})
    # colour regions: greedy merge, the largest path of a region gives its colour
    regions = []
    for p in sorted(paths, key=lambda q: -q["area"]):
        for r in regions:
            if sum((a - b) ** 2 for a, b in zip(p["rgb"], r["rgb"])) <= merge * merge:
                r["paths"].append(p)
                r["area"] += p["area"]
                break
        else:
            regions.append({"rgb": p["rgb"], "paths": [p], "area": p["area"]})
    regions.sort(key=lambda r: -r["area"])

    ET.register_namespace("", SVG_NS)
    w, h = root.get("width", "0"), root.get("height", "0")
    out = ET.Element(f"{{{SVG_NS}}}svg", {"version": "1.1", "width": w, "height": h, "viewBox": f"0 0 {w} {h}",
                                          "data-source": "auto-trace"})
    ET.SubElement(out, f"{{{SVG_NS}}}desc").text = NOTE
    groups = []
    for i, r in enumerate(regions, 1):
        gid = f"{prefix}-{i:02d}"
        color = "#%02x%02x%02x" % r["rgb"]
        g = ET.SubElement(out, f"{{{SVG_NS}}}g", {"id": gid, "data-color": color, "data-paths": str(len(r["paths"]))})
        for p in r["paths"]:
            g.append(p["el"])
        groups.append({"id": gid, "color": color, "paths": len(r["paths"])})
    ET.indent(out)
    return out, groups


def main():
    ap = argparse.ArgumentParser(description="Raster in, layered SVG out (one named group per colour region).")
    ap.add_argument("image")
    ap.add_argument("-o", "--out", help="output SVG (default: the image name with .svg)")
    ap.add_argument("--merge", type=float, default=24, help="RGB distance under which two fills join one region (default 24)")
    ap.add_argument("--speckle", type=int, default=4, help="drop patches smaller than this many pixels across (default 4)")
    ap.add_argument("--precision", type=int, default=6, help="colour precision in bits per channel, 1 to 8 (default 6)")
    ap.add_argument("--mode", choices=("spline", "polygon"), default="spline")
    ap.add_argument("--prefix", default="region", help="group id prefix (default region)")
    a = ap.parse_args()
    try:
        import vtracer
    except ImportError:
        sys.exit(f"vectorize.py needs vtracer==0.6.15: install the pins in {REQUIREMENTS} into a project virtual "
                 "environment (python -m pip install -r requirements.txt) after the user agrees")
    src = Path(a.image)
    if not src.is_file():
        sys.exit(f"input not found: {src}")
    if not 1 <= a.precision <= 8:
        sys.exit("--precision must be 1 to 8")
    out_path = Path(a.out) if a.out else src.with_suffix(".svg")
    root = trace(vtracer, src, a.mode, a.speckle, a.precision)
    svg, groups = layered(root, a.merge, re.sub(r"[^A-Za-z0-9_-]", "-", a.prefix) or "region")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    ET.ElementTree(svg).write(out_path, encoding="utf-8", xml_declaration=True)
    print(json.dumps({"svg": str(out_path), "groups": groups, "note": NOTE}, indent=1))


if __name__ == "__main__":
    main()
