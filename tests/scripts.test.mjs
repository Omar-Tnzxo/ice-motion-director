// Bundled scripts: syntax of every Node and Python file, cross-platform lint, help output, and (when ffmpeg is on
// PATH) a smoke run of the QA scripts on a generated clip. Optional: ICE_RENDER_SMOKE_PROJECT=<folder with
// playwright-core installed> plus ICE_CHROME renders a one-second page with skills/ice-engines/scripts/render-html.mjs.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { abs, findPython, hasCommand, readText, repoFiles } from "./helpers.mjs";

const files = repoFiles();
const NODE_FILES = files.filter((f) => /\.(mjs|cjs|js)$/.test(f) && !f.startsWith("tests/"));
const PY_FILES = files.filter((f) => f.endsWith(".py"));
const SCRIPT_FILES = files.filter((f) => /^skills\/[^/]+\/scripts\//.test(f));
const PYTHON = findPython();
const requirePython = Boolean(process.env.CI);

test("every Node script parses (node --check)", () => {
  const problems = [];
  for (const f of NODE_FILES) {
    const r = spawnSync(process.execPath, ["--check", abs(f)], { encoding: "utf8" });
    if (r.status !== 0) problems.push(`${f}: ${r.stderr.trim().split(/\r?\n/).slice(0, 4).join(" | ")}`);
  }
  assert.deepEqual(problems, []);
});

test("every Python script parses", (t) => {
  if (!PYTHON) { if (requirePython) assert.fail("Python 3 not found (set PYTHON)"); t.skip("Python 3 not found"); return; }
  const code = "import ast,sys\nbad=[]\nfor p in sys.argv[1:]:\n  try: ast.parse(open(p,encoding='utf-8').read(),p)\n  except SyntaxError as e: bad.append(f'{p}:{e.lineno}: {e.msg}')\nprint('\\n'.join(bad))";
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", code, ...PY_FILES.map(abs)], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "", r.stdout);
});

test("scripts are Node or Python, never shell-only", () => {
  const bad = SCRIPT_FILES.filter((f) => /\.(sh|bash|zsh|fish|ps1|psm1|bat|cmd)$/i.test(f));
  assert.deepEqual(bad, [], "rewrite shell scripts in Node or Python so they run on Windows, macOS and Linux");
});

// Python patterns that break on Windows (cp1252 default encoding) or are POSIX only, found with the ast module.
const PY_LINT = String.raw`
import ast, sys
out = []
for path in sys.argv[1:]:
    src = open(path, encoding="utf-8").read()
    tree = ast.parse(src, path)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for a in node.names:
                if a.name.split(".")[0] in ("fcntl", "termios", "pwd", "grp", "resource"):
                    out.append(f"{path}:{node.lineno}: POSIX-only module {a.name}")
        if not isinstance(node, ast.Call):
            continue
        kw = {k.arg: k.value for k in node.keywords if k.arg}
        f = node.func
        name = f.attr if isinstance(f, ast.Attribute) else (f.id if isinstance(f, ast.Name) else "")
        owner = f.value.id if isinstance(f, ast.Attribute) and isinstance(f.value, ast.Name) else ""
        def const(v):
            return v.value if isinstance(v, ast.Constant) else None
        if name == "open" and owner in ("", "io", "codecs"):
            mode = const(node.args[1]) if len(node.args) > 1 else const(kw.get("mode"))
            if (mode is None or "b" not in str(mode)) and "encoding" not in kw and not (len(node.args) > 3):
                out.append(f"{path}:{node.lineno}: text open() without encoding=\"utf-8\"")
        if name in ("read_text", "write_text") and "encoding" not in kw and not (name == "read_text" and node.args) and not (name == "write_text" and len(node.args) > 1):
            out.append(f"{path}:{node.lineno}: {name}() without encoding=\"utf-8\"")
        if owner == "subprocess" or name in ("run", "Popen", "check_output", "check_call", "call"):
            if any(const(kw.get(k)) is True for k in ("text", "universal_newlines")) and "encoding" not in kw:
                out.append(f"{path}:{node.lineno}: subprocess text mode without encoding=\"utf-8\"")
            if const(kw.get("shell")) is True:
                out.append(f"{path}:{node.lineno}: shell=True")
        if owner == "os" and name in ("system", "popen", "getuid", "geteuid", "fork", "symlink", "killpg", "setsid"):
            out.append(f"{path}:{node.lineno}: os.{name} is POSIX-only or shell-based")
    for i, line in enumerate(src.splitlines(), 1):
        s = line.split("#")[0]
        if '"/tmp' in s or "'/tmp" in s or "/dev/null" in s:
            out.append(f"{path}:{i}: hardcoded /tmp or /dev/null (use tempfile or subprocess.DEVNULL)")
print("\n".join(out))
`;

test("Python scripts: UTF-8 text I/O, no shell, no POSIX-only calls", (t) => {
  if (!PYTHON) { if (requirePython) assert.fail("Python 3 not found (set PYTHON)"); t.skip("Python 3 not found"); return; }
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", PY_LINT, ...PY_FILES.filter((f) => f.startsWith("skills/")).map(abs)], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const problems = r.stdout.trim() ? r.stdout.trim().split(/\r?\n/).map((l) => l.replace(abs(""), "")) : [];
  assert.deepEqual(problems, []);
});

// Every third-party import in skills/<skill>/scripts is pinned in that skill's requirements.txt, and nothing pinned
// there is unused.
const PY_IMPORTS = String.raw`
import ast, sys, pathlib, re, json
MAP = {"cv2": "opencv-python-headless", "PIL": "pillow", "sklearn": "scikit-learn", "yaml": "pyyaml"}
out = []
for skill in map(pathlib.Path, sys.argv[1:]):
    req = skill / "scripts" / "requirements.txt"
    pins = set()
    if req.exists():
        for line in req.read_text(encoding="utf-8").splitlines():
            m = re.match(r"([A-Za-z0-9._-]+)==", line)
            if m:
                pins.add(m.group(1).lower())
    used = {}
    for f in (skill / "scripts").rglob("*.py"):
        local = {p.stem for p in f.parent.glob("*.py")} | {p.name for p in f.parent.iterdir() if p.is_dir()}
        src = f.read_text(encoding="utf-8")
        for n in ast.walk(ast.parse(src)):
            mods = [a.name for a in n.names] if isinstance(n, ast.Import) else ([n.module] if isinstance(n, ast.ImportFrom) and n.level == 0 and n.module else [])
            for m in mods:
                top = m.split(".")[0]
                if top in sys.stdlib_module_names or top in local or top in ("mgaudio", "__future__"):
                    continue
                used.setdefault(MAP.get(top, top).lower(), f.name)
        for m in re.findall(r"require\(\s*['\"]([a-z_]+)['\"]", src):
            used.setdefault(MAP.get(m, m).lower(), f.name)
    for k, f in sorted(used.items()):
        if k not in pins:
            out.append(f"{skill.name}: {f} imports {k}, which scripts/requirements.txt does not pin")
    for k in sorted(pins - set(used)):
        out.append(f"{skill.name}: requirements.txt pins {k}, which no script imports")
print("\n".join(out))
`;

test("third-party Python imports are pinned in the skill's requirements.txt", (t) => {
  if (!PYTHON) { if (requirePython) assert.fail("Python 3 not found (set PYTHON)"); t.skip("Python 3 not found"); return; }
  const skills = [...new Set(PY_FILES.filter((f) => /^skills\/[^/]+\/scripts\//.test(f)).map((f) => f.split("/")[1]))];
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", PY_IMPORTS, ...skills.map((s) => abs(`skills/${s}`))], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.stdout.trim() ? r.stdout.trim().split(/\r?\n/) : [], []);
});

// shell: true is allowed only where the user supplies a whole command line on purpose.
const SHELL_ALLOWED = new Set(["skills/ice-qa/scripts/seam-gate.mjs"]);
test("Node scripts: portable paths, no hardcoded POSIX locations", () => {
  const problems = [];
  for (const f of NODE_FILES.filter((x) => x.startsWith("skills/"))) {
    readText(f).split(/\r?\n/).forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, "");
      if (/new URL\(\s*import\.meta\.url\s*\)\.pathname/.test(code)) problems.push(`${f}:${i + 1}: use fileURLToPath(import.meta.url)`);
      if (/import\.meta\.(filename|dirname)\b/.test(code)) problems.push(`${f}:${i + 1}: import.meta.filename needs Node 20.11+; use fileURLToPath(import.meta.url)`);
      if (/['"`]\/(tmp|dev\/null)\b/.test(code)) problems.push(`${f}:${i + 1}: hardcoded /tmp or /dev/null (use os.tmpdir() or stdio "ignore")`);
      if (/shell\s*:\s*true/.test(code) && !SHELL_ALLOWED.has(f)) problems.push(`${f}:${i + 1}: shell: true`);
      if (/\b(exec|execSync)\s*\(\s*[`'"]/.test(code)) problems.push(`${f}:${i + 1}: exec with a command string runs a shell; use execFile/spawn with an argument list`);
    });
  }
  assert.deepEqual(problems, []);
});

// ---------------------------------------------------------------- help output
const NODE_HELP = ["skills/ice-qa/scripts/contact-sheet.mjs", "skills/ice-qa/scripts/frozen-time.mjs", "skills/ice-qa/scripts/loudness.mjs",
  "skills/ice-qa/scripts/probe-mp4.mjs", "skills/ice-qa/scripts/lint.mjs", "skills/ice-qa/scripts/validate-beat-sync.mjs",
  "skills/ice-engines/scripts/render-html.mjs", "skills/ice-assets/scripts/validate-assets.mjs", "skills/ice-edit/scripts/apply-cuts.mjs",
  "skills/ice-edit/scripts/build-edl-review.mjs", "skills/ice-edit/scripts/cut-silences.mjs", "skills/ice-edit/scripts/find-cut-candidates.mjs",
  "skills/ice-lottie/scripts/motion-tokens.mjs", "skills/ice-motion/scripts/measured-eases.mjs", "skills/ice-motion/scripts/springs.mjs",
  "skills/ice-motion-director/scripts/ice-state.mjs"];

test("Node scripts print help and exit 0", () => {
  const problems = [];
  for (const f of NODE_HELP) {
    const r = spawnSync(process.execPath, [abs(f), "--help"], { encoding: "utf8", cwd: tmpdir(), timeout: 60000 });
    if (r.status !== 0 || !r.stdout.trim()) problems.push(`${f}: exit ${r.status} ${r.stderr.trim().slice(0, 200)}`);
  }
  assert.deepEqual(problems, []);
});

// Without site-packages (python -S) every Python entry script must either print help or explain which pinned
// package is missing, never crash with a traceback, even with stdout on a pipe (cp1252 on Windows).
test("Python entry scripts: help or a clear missing-package message, never a traceback", (t) => {
  if (!PYTHON) { if (requirePython) assert.fail("Python 3 not found (set PYTHON)"); t.skip("Python 3 not found"); return; }
  const entries = PY_FILES.filter((f) => /^skills\/[^/]+\/scripts\//.test(f) && !/\/mgaudio\//.test(f))
    .filter((f) => /if __name__ == ["']__main__["']/.test(readText(f)) && /argparse/.test(readText(f)));
  const problems = [];
  const env = { ...process.env, PYTHONIOENCODING: "", PYTHONUTF8: "0" };
  for (const f of entries) {
    const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-S", abs(f), "--help"], { encoding: "utf8", env, timeout: 60000 });
    const err = `${r.stderr}`;
    if (/Traceback \(most recent call last\)/.test(err)) problems.push(`${f}: traceback: ${err.trim().split(/\r?\n/).slice(-1)[0]}`);
    else if (r.status !== 0 && !/requirements\.txt/.test(err + r.stdout)) problems.push(`${f}: exit ${r.status} without naming requirements.txt: ${err.trim().slice(0, 200)}`);
  }
  assert.deepEqual(problems, []);
});

// ---------------------------------------------------------------- smoke runs on a generated clip
const FFMPEG = hasCommand("ffmpeg") && hasCommand("ffprobe");
const work = mkdtempSync(join(tmpdir(), "ice tests "));
after(() => rmSync(work, { recursive: true, force: true }));
const clip = join(work, "film one.mp4");
const node = (f, ...args) => spawnSync(process.execPath, [abs(f), ...args], { encoding: "utf8", cwd: work, timeout: 120000 });

test("QA scripts run on a generated clip (paths with spaces)", { skip: FFMPEG ? false : "ffmpeg or ffprobe not on PATH" }, () => {
  const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=320x240:rate=30:duration=2",
    "-f", "lavfi", "-i", "color=c=gray:size=320x240:rate=30:duration=1", "-f", "lavfi", "-i", "sine=frequency=440:duration=3",
    "-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]", "-map", "[v]", "-map", "2:a", "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac", clip], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);

  let r = node("skills/ice-qa/scripts/probe-mp4.mjs", clip, "320x240", "30");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /320x240\s+h264\s+30 fps\s+3\.00s/);
  assert.match(r.stdout, /OK spec/);
  r = node("skills/ice-qa/scripts/probe-mp4.mjs", clip, "1080x1920", "25");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL resolution/);
  assert.match(r.stdout, /FAIL fps/);

  r = node("skills/ice-qa/scripts/frozen-time.mjs", clip);
  assert.equal(r.status, 0, r.stderr);
  const n = Number(/near-frozen samples: (\d+)/.exec(r.stdout)?.[1]);
  assert.ok(n >= 8 && n <= 10, `expected about 1 s of frozen samples, got ${n}\n${r.stdout}`);

  r = node("skills/ice-qa/scripts/loudness.mjs", clip);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^ I: -?\d+(\.\d+)? LUFS$/m);
  assert.match(r.stdout, /short-term per second:\r?\n(\d+:-?\d+(\.\d+)? )+/);

  const sheet = join(work, "sheet out.jpg");
  r = node("skills/ice-qa/scripts/contact-sheet.mjs", clip, sheet, "1", "3", "1");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(sheet) && readFileSync(sheet).length > 1000, "contact sheet not written");
});

test("render-html.mjs renders a one-second page", { skip: process.env.ICE_RENDER_SMOKE_PROJECT ? false : "set ICE_RENDER_SMOKE_PROJECT to a folder with playwright-core installed" }, () => {
  assert.ok(FFMPEG, "ffmpeg is required for the render smoke test");
  const project = process.env.ICE_RENDER_SMOKE_PROJECT;
  const page = join(project, "smoke page", "index.html");
  spawnSync(process.execPath, ["-e", `require("fs").mkdirSync(${JSON.stringify(join(project, "smoke page"))}, { recursive: true })`]);
  writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#123}</style></head><body>
<canvas id="c" width="320" height="180"></canvas><script>
window.DEMO = { width: 320, height: 180, fps: 10, duration: 1 };
const c = document.getElementById("c").getContext("2d");
window.renderAt = async (t) => { c.fillStyle = "#123"; c.fillRect(0, 0, 320, 180); c.fillStyle = "#f80"; c.fillRect(20 + 200 * t, 60, 60, 60); };
window.__ready = true;
</script></body></html>`);
  const out = join(project, "smoke page", "out", "draft one.mp4");
  const r = spawnSync(process.execPath, [abs("skills/ice-engines/scripts/render-html.mjs"), page, "--out", out],
    { encoding: "utf8", cwd: project, timeout: 300000 });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const p = spawnSync(process.execPath, [abs("skills/ice-qa/scripts/probe-mp4.mjs"), out, "320x180", "10"], { encoding: "utf8" });
  assert.equal(p.status, 0, p.stdout + p.stderr);
});

// ---------------------------------------------------------------- ice-state.mjs (router state tool)
// The spine contract: refusals name the command to run first, parallel lanes and split stages follow the order,
// step mode accepts only the user's approval, reopening sends later approved stages back to review, and the
// schema refuses keys it does not list.
test("ice-state.mjs: init, check, set, reopen, next and schema refusals", () => {
  const dir = join(work, "state project");
  const st = (...args) => spawnSync(process.execPath, [abs("skills/ice-motion-director/scripts/ice-state.mjs"), ...args, "--dir", dir],
    { encoding: "utf8", timeout: 60000 });
  const json = () => JSON.parse(readFileSync(join(dir, "ice", "state.json"), "utf8"));

  let r = st("check", "04");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /no project in this folder yet.*`\/ice-01-brief`/);
  assert.equal(st("check", "01").status, 0);

  r = st("init", "--project", "demo", "--route", "film", "--subtype", "app ad", "--mode", "step");
  assert.equal(r.status, 0, r.stderr);
  const s0 = json();
  assert.deepEqual(s0.order, ["01", "02", "03", ["04", "05"], "06", ["07", "08a"], "08b", "09", "10"]);
  assert.deepEqual(Object.keys(s0.stages).sort(), ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
  assert.deepEqual(s0.stages["08"].parts, { a: "missing", b: "missing" });
  assert.equal(st("init", "--project", "demo", "--route", "film").status, 1, "init must not overwrite a project");

  r = st("check", "02");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /brief is still in progress/);
  assert.equal(st("set", "04", "in_progress").status, 1, "a stage whose prerequisites are not ready is refused");

  assert.equal(st("set", "01", "in_review", "--artifact", "ice/BRIEF.md").status, 0);
  r = st("check", "02");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /waiting for review.*`\/ice-01-brief` shows it again/);
  r = st("set", "01", "approved", "--by", "approver");
  assert.equal(r.status, 1, "step mode refuses an approver approval");
  assert.match(r.stderr, /only the user's own words/);
  for (const nn of ["01", "02", "03"]) {
    if (nn !== "01") assert.equal(st("set", nn, "in_review").status, 0);
    assert.equal(st("set", nn, "approved", "--by", "user").status, 0);
  }
  r = st("next");
  assert.match(r.stdout, /next: 04 \(missing\), 05 \(missing\)/, "04 and 05 are one parallel lane");
  r = st("check", "06");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Before the animatic I need the storyboard approved\. Run `\/ice-04-storyboard` first\./);
  for (const nn of ["04", "05", "06"]) { st("set", nn, "in_review"); assert.equal(st("set", nn, "approved", "--by", "user").status, 0); }

  r = st("check", "08", "--prefix", "$");
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /08a/, "08 runs part a while 07 is not built");
  assert.equal(st("set", "08", "approved", "--by", "user").status, 2, "a split stage is approved part by part");
  st("set", "08a", "in_review");
  assert.equal(st("set", "08a", "approved", "--by", "user").status, 0);
  r = st("check", "08", "--prefix", "$");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /mix and master.*I need the build approved\. Run `\$ice-07-build` first/);

  st("set", "07", "in_review", "--artifact", "ice/renders/draft-1.mp4");
  st("set", "07", "approved", "--by", "user");
  r = st("check", "09");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Before the review I need the sound \(mix and master\) approved/);
  r = st("check", "08");
  assert.equal(r.status, 1, "08b needs the draft on disk");
  assert.match(r.stdout, /draft render/);
  spawnSync(process.execPath, ["-e", `const f=require("fs");f.mkdirSync(${JSON.stringify(join(dir, "ice", "renders"))},{recursive:true});f.writeFileSync(${JSON.stringify(join(dir, "ice", "renders", "draft-1.mp4"))},"x")`]);
  assert.equal(st("check", "08").status, 0);
  st("set", "08b", "in_review");
  assert.equal(st("set", "08b", "approved", "--by", "user").status, 0);
  assert.equal(json().stages["08"].status, "approved");

  assert.equal(st("set", "03", "in_progress", "--notes", "new claim").status, 0);
  const s1 = json();
  for (const nn of ["04", "05", "06", "07"]) assert.equal(s1.stages[nn].status, "in_review", `${nn} goes back to review`);
  assert.equal(s1.stages["08"].parts.a, "in_review");
  assert.equal(s1.stages["04"].notes, "upstream change in 03");
  assert.equal(s1.stages["02"].status, "approved", "earlier stages stay approved");

  assert.equal(st("set", "colour", "blue").status, 2, "keys outside the schema are refused");
  assert.equal(st("set", "size", "huge").status, 2);
  assert.equal(st("set", "question", "Who is it for?", "--answer", "students", "--by", "user").status, 0);
  assert.deepEqual(json().questions, [{ question: "Who is it for?", answer: "students", answered_by: "user" }]);
  assert.equal(st("set", "run_mode", "fast").status, 0, "run_mode is in the schema");
  assert.equal(json().run_mode, "fast");
  assert.equal(st("set", "current", "11").status, 2, "current must be a stage number");

  assert.equal(st("set", "order", "01 02 04 05 07 09 10").status, 0);
  r = st("check", "06");
  assert.equal(r.status, 3, "a stage left out of the order is not needed");
  r = st("show");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\| 01 \| brief \| approved \| `ice\/BRIEF\.md` \|/);
  assert.equal(readdirSync(join(dir, "ice")).filter((f) => /lock|tmp/.test(f)).length, 0, "no lock or temp file left behind");
});
