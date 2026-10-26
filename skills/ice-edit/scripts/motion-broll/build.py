# Adapted from Barty-Bart/motion-graphics skills/motion-broll/engine/build.py and engine/base.css (MIT, Copyright (c) 2026 Bart). Changes: base.css inlined; fonts: project or user font files always win, then the font the direction chose, from either an installed system family or a Google Fonts family (downloaded at build time, cached, embedded; a disclosed network call), with no fixed order between those two; --offline flag or ICE_OFFLINE=1 disables Google Fonts; font aliases renamed ClipSans/ClipMono; UTF-8 file I/O and console output for Windows. See ../NOTICE.md.
"""Assemble clip fragments + engine + fonts into self-contained HTML files.

usage: python build.py <out_dir> [options] clips/01-name.html [clips/02-name.html ...]

Fonts for the UI face (ClipSans) and the mono face (ClipMono):
  1. Project or user-supplied font files always win:  --font <file>  --mono <file>
     (.woff2 .woff .ttf .otf)
  2. Otherwise the font the direction step chose (ice/DIRECTION.md or the project's font choice),
     from whichever source it names; both sources are supported equally, neither is preferred:
       installed system family:  --font-system "<Family>"   --mono-system "<Family>"
       Google Fonts family:      --font-google "<Family>"   --mono-google "<Family>"
     The same choice can come from a JSON file: --fonts <fonts.json> with
       {"ui":   {"file": "<path>"} | {"system": "<Family>"} | {"google": "<Family>"},
        "mono": {...same...}}
     Google Fonts is a NETWORK CALL at build time to fonts.googleapis.com and fonts.gstatic.com;
     files are cached in <out_dir>/.font-cache and embedded, so rendering needs no network.
  3. Nothing chosen: the generic system stack (system-ui, ui-monospace).
Offline switch: --offline, or the environment variable ICE_OFFLINE=1: only project files and
installed system fonts are used; a Google choice falls back to the generic system stack with a
warning (choose a system family for offline builds). A failed download does the same."""
import base64, hashlib, json, os, re, sys, pathlib, urllib.parse, urllib.request
E = pathlib.Path(__file__).resolve().parent
b64 = lambda data: base64.b64encode(data).decode()
FMT = {'.woff2': 'woff2', '.woff': 'woff', '.ttf': 'truetype', '.otf': 'opentype'}
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
BASE_CSS = """html,body{margin:0;background:#E9E7E2;overflow:hidden}
html.alpha,html.alpha body{background:transparent}
body.preview{height:100vh;background:#1b1b1b}
html:not(.alpha) body.preview{background:#E9E7E2}
#wrap{position:relative;transform-origin:50% 50%}
body.preview #wrap{position:fixed;left:50%;top:calc(50% - 10px)}
#stage{position:relative;overflow:hidden;font-family:'ClipSans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:#0B0B0B;font-feature-settings:"tnum" 1}
#world{position:absolute;left:0;top:0;transform-origin:0 0}
#shape{position:absolute;overflow:hidden;isolation:isolate;box-shadow:0 1px 2px rgba(20,18,14,.06),0 10px 30px -8px rgba(20,18,14,.16)}
html.alpha #shape{box-shadow:none}
.L{position:absolute;width:0;height:0;transform-origin:0 0}
.a{position:absolute}
.row{position:absolute;display:flex;align-items:center;white-space:nowrap}
.blend{mix-blend-mode:difference}
.mono{font-family:'ClipMono',ui-monospace,monospace}
svg{display:block;overflow:visible}
#cursor{position:absolute;left:0;top:0;height:auto;transform-origin:3px 3px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25));z-index:10}
"""
CURSOR = '<svg id="cursor" viewBox="0 0 40 56"><path d="M3 3 L3 41 L12.5 32 L19 47 L25.5 44.2 L19.2 29.8 L32 29.8 Z" fill="#0B0B0B" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>'


def file_face(alias, path):
    """Tier 1: a project font file embedded as a data URI."""
    p = pathlib.Path(path)
    if not p.is_file():
        sys.exit(f'font file not found: {p}')
    fmt = FMT.get(p.suffix.lower())
    if not fmt:
        sys.exit(f'unsupported font type {p.suffix} (use .woff2, .woff, .ttf or .otf)')
    mime = 'font/' + p.suffix.lower().lstrip('.')
    return f"@font-face{{font-family:'{alias}';src:url(data:{mime};base64,{b64(p.read_bytes())}) format('{fmt}');font-weight:100 900}}\n"


def fetch(url, cache):
    """GET with a browser user agent, cached on disk by URL hash."""
    cache.mkdir(parents=True, exist_ok=True)
    f = cache / hashlib.sha256(url.encode()).hexdigest()
    if f.is_file():
        return f.read_bytes()
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    f.write_bytes(data)
    return data


def google_face(alias, family, cache):
    """Tier 2: download a Google Fonts family (all its subsets) and embed it under the alias."""
    fam = urllib.parse.quote_plus(family)
    for axis in (':wght@100..900', ':wght@400;500;600;700', ''):
        url = f'https://fonts.googleapis.com/css2?family={fam}{axis}&display=block'
        try:
            css = fetch(url, cache).decode('utf-8')
            break
        except Exception:
            css = None
    if not css or '@font-face' not in css:
        raise RuntimeError(f'Google Fonts has no family named "{family}" or it could not be reached')
    def inline(m):
        u = m.group(1)
        mime = 'font/woff2' if u.endswith('.woff2') else 'font/ttf'
        return f'url(data:{mime};base64,{b64(fetch(u, cache))})'
    css = re.sub(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', inline, css)
    return re.sub(r"font-family:\s*'[^']*'", f"font-family: '{alias}'", css) + '\n'


def css_name(family):
    """Quote a family name for CSS, refusing characters that could break out of the rule."""
    if not re.fullmatch(r"[\w .\-]+", family, re.U):
        sys.exit(f'invalid font family name: {family!r}')
    return "'" + family + "'"


def choices(opts):
    """Per face: ('file'|'system'|'google', value) or None. A font file (flag or JSON) always wins;
    otherwise a command-line system or Google choice overrides the JSON choice. Naming both a
    system and a Google family for one face is ambiguous and stops the build."""
    doc = json.load(open(opts['fonts'], encoding='utf-8')) if opts.get('fonts') else {}
    picked = {}
    for face_key, prefix in (('ui', 'font'), ('mono', 'mono')):
        spec = doc.get(face_key) or {}
        cli = {s: opts.get(k) for s, k in (('file', prefix), ('system', prefix + '-system'), ('google', prefix + '-google')) if opts.get(k)}
        for layer in (cli, spec):
            if len([s for s in ('system', 'google') if layer.get(s)]) > 1:
                sys.exit(f'{face_key}: name either a system family or a Google family, not both')
        file_value = cli.get('file') or spec.get('file')
        if file_value:
            picked[face_key] = ('file', file_value); continue
        for layer in (cli, spec):
            src = next((s for s in ('system', 'google') if layer.get(s)), None)
            if src:
                picked[face_key] = (src, layer[src]); break
        else:
            picked[face_key] = None
    return picked


def font_css(opts, cache):
    offline = opts['offline'] or os.environ.get('ICE_OFFLINE', '').strip().lower() in ('1', 'true', 'yes')
    faces, rules = '', ''
    for face_key, alias, selector, generic in (('ui', 'ClipSans', '#stage', "system-ui,sans-serif"), ('mono', 'ClipMono', '.mono', "ui-monospace,monospace")):
        choice = choices(opts)[face_key]
        if not choice:
            print(f'{alias}: no font chosen, generic system stack'); continue
        src, value = choice
        if src == 'file':
            faces += file_face(alias, value); print(f'{alias}: project font {value}'); continue
        if src == 'system':
            rules += f"{selector}{{font-family:{css_name(value)},{generic}}}\n"
            print(f'{alias}: installed system family "{value}"'); continue
        if offline:
            print(f'warning: {alias}: offline, Google family "{value}" skipped; generic system stack', file=sys.stderr); continue
        try:
            faces += google_face(alias, value, cache); print(f'{alias}: Google Fonts "{value}" (network, cached in {cache})')
        except Exception as e:
            print(f'warning: {alias}: {e}; generic system stack', file=sys.stderr)
    return faces, rules


def build(src, dst, fonts):
    faces, rules = fonts
    frag = open(src, encoding='utf-8').read()
    m = re.search(r'<title>(.*?)</title>', frag); title = m.group(1) if m else pathlib.Path(src).stem
    css = ''.join(re.findall(r'<style>(.*?)</style>', frag, re.S))
    slot = lambda n: (re.search(rf'<div data-slot="{n}">(.*?)</div><!--/{n}-->', frag, re.S) or [None, ''])[1]
    js = ''.join(re.findall(r'<script>(.*?)</script>', frag, re.S))
    html = (f'<!doctype html><html><head><meta charset="utf-8"><title>{title}</title><style>{faces}{BASE_CSS}{rules}{css}</style></head><body>\n'
            f'<div id="wrap"><div id="stage"><div id="world">{slot("world")}<div id="shape">{slot("shape")}</div>{slot("over")}</div>{CURSOR}</div></div>\n'
            f'<script>{open(E / "motion.js", encoding="utf-8").read()}</script><script>{js}</script></body></html>')
    open(dst, 'w', encoding='utf-8').write(html)


if __name__ == '__main__':
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    args = sys.argv[1:]
    if not args or args[0] in ('-h', '--help'):
        print(__doc__); sys.exit(0 if args else 2)
    out = pathlib.Path(args[0]); out.mkdir(parents=True, exist_ok=True)
    opts, clips, i = {'offline': False}, [], 1
    while i < len(args):
        a = args[i]
        if a == '--offline':
            opts['offline'] = True; i += 1
        elif a in ('--font', '--mono', '--font-system', '--mono-system', '--font-google', '--mono-google', '--fonts'):
            if i + 1 >= len(args): sys.exit(f'{a} needs a value')
            opts[a[2:]] = args[i + 1]; i += 2
        elif a.startswith('--'):
            sys.exit(f'unknown option {a}')
        else:
            clips.append(a); i += 1
    if not clips:
        sys.exit('no clip fragments given')
    fonts = font_css(opts, out / '.font-cache')
    for s in clips:
        d = out / (pathlib.Path(s).stem + '.html'); build(s, d, fonts); print('built', d)
