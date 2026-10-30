// Bundled scripts: syntax of every Node and Python file, cross-platform lint, help output, and (when ffmpeg is on
// PATH) a smoke run of the QA scripts on a generated clip. Optional: ICE_RENDER_SMOKE_PROJECT=<folder with
// playwright-core installed> plus ICE_CHROME renders a one-second page with skills/ice-engines/scripts/render-html.mjs.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
const NODE_HELP = ["skills/ice-qa/scripts/quick-checks.mjs",
  "skills/ice-qa/scripts/lint.mjs", "skills/ice-qa/scripts/validate-beat-sync.mjs",
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

// Python scripts with subcommands: the main help and each subcommand's help, with exit 0 and a usage line.
const PY_HELP = [["skills/ice-qa/scripts/craft_gate.py"], ["skills/ice-qa/scripts/craft_gate.py", "plan"],
  ["skills/ice-qa/scripts/craft_gate.py", "measure"], ["skills/ice-qa/scripts/craft_gate.py", "build"]];

test("Python scripts with subcommands print help and exit 0", (t) => {
  if (!PYTHON) { if (requirePython) assert.fail("Python 3 not found (set PYTHON)"); t.skip("Python 3 not found"); return; }
  const problems = [];
  for (const [f, ...sub] of PY_HELP) {
    const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), abs(f), ...sub, "--help"], { encoding: "utf8", cwd: tmpdir(), timeout: 60000 });
    if (r.status !== 0 || !/usage: /.test(r.stdout)) problems.push(`${f} ${sub.join(" ")}: exit ${r.status} ${r.stderr.trim().slice(0, 200)}`);
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

  let r = node("skills/ice-qa/scripts/quick-checks.mjs", "probe", clip, "320x240", "30");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /320x240\s+h264\s+30 fps\s+3\.00s/);
  assert.match(r.stdout, /OK spec/);
  r = node("skills/ice-qa/scripts/quick-checks.mjs", "probe", clip, "1080x1920", "25");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL resolution/);
  assert.match(r.stdout, /FAIL fps/);
  r = node("skills/ice-qa/scripts/quick-checks.mjs", "probe");
  assert.equal(r.status, 2, "probe without a file is a usage error");
  r = node("skills/ice-qa/scripts/quick-checks.mjs", "probe", "--help");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /usage: node quick-checks\.mjs probe <file\.mp4> \[WxH\] \[fps\]/);

  r = node("skills/ice-qa/scripts/quick-checks.mjs", "frozen", clip);
  assert.equal(r.status, 0, r.stderr);
  const n = Number(/near-frozen samples: (\d+)/.exec(r.stdout)?.[1]);
  assert.ok(n >= 8 && n <= 10, `expected about 1 s of frozen samples, got ${n}\n${r.stdout}`);

  r = node("skills/ice-qa/scripts/quick-checks.mjs", "loudness", clip);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^ I: -?\d+(\.\d+)? LUFS$/m);
  assert.match(r.stdout, /short-term per second:\r?\n(\d+:-?\d+(\.\d+)? )+/);

  const sheet = join(work, "sheet out.jpg");
  r = node("skills/ice-qa/scripts/quick-checks.mjs", "sheet", clip, sheet, "1", "3", "1");
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
  const p = spawnSync(process.execPath, [abs("skills/ice-qa/scripts/quick-checks.mjs"), "probe", out, "320x180", "10"], { encoding: "utf8" });
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

// ---------------------------------------------------------------- craft_gate.py (the craft gate, 0.2.5)
// The plan check needs only the standard library; the build check needs numpy, opencv and ffmpeg. The rule itself:
// skills/ice-direction/references/treatment.md section "Craft plan".
const CRAFT = abs("skills/ice-qa/scripts/craft_gate.py");
const CRAFT_CODES = ["camera", "depth", "composite", "light", "finish", "type", "transition", "data", "cutout", "sfx", "music",
  "ambience", "foley", "silence", "voice", "rhythm", "footage", "identity"];
const craftPy = (...args) => spawnSync(PYTHON[0], [...PYTHON.slice(1), CRAFT, ...args], { encoding: "utf8", timeout: 120000 });
const HAS_CV = Boolean(PYTHON) && spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", "import numpy, cv2"], { encoding: "utf8" }).status === 0;
const STORYBOARD = "| Time | Object | Action | Camera | On-screen text | Trigger | Reason |\n|---|---|---|---|---|---|---|\n"
  + "| 0-3 | steaming cup | steam rises past the rim | slow push | none | VO line 1 | warmth before the claim |\n"
  + "| 3-6 | hand | lifts the cup to the window | locked | none | VO line 2 | the payoff lands on the hand |\n";
const useRow = (dimension, where) => ({ dimension, decision: "use", devices: ["type default device"], where, amount: "type floor",
  trigger: "type default", reason: "serves the beat it is mapped to", source: "type: treatment.md craft plan defaults",
  check: "craft_gate.py build", evidence: "" });
const notUseRow = (dimension, reason, source) => ({ dimension, decision: "not_use", devices: [], where: [], amount: "", trigger: "",
  reason, source, check: "craft_gate.py plan", evidence: "" });
const goodCraftRows = () => CRAFT_CODES.map((c, i) => c === "data"
  ? notUseRow(c, "content: no number, place, route or timeline in the VO lines of script.md", "content: ice/plan/script.md")
  : c === "footage" ? notUseRow(c, "type policy: this film is built from drawn scenes", "type: treatment.md craft plan defaults")
    : useRow(c, [["1"], ["shot 2"], ["B1"], ["film"], ["0-3"]][i % 5]));
function craftProject(name, { rows = goodCraftRows(), styleNeeds = [], script = "", stage = "04", exemptions = [], state = null } = {}) {
  const dir = join(work, name);
  mkdirSync(join(dir, "ice", "plan"), { recursive: true });
  writeFileSync(join(dir, "ice", "plan", "storyboard.md"), `Style: set at 05\nPalette: set at 05\nCharacters: hands only\n\n${STORYBOARD}`);
  writeFileSync(join(dir, "ice", "plan", "script.md"), script);
  writeFileSync(join(dir, "ice", "plan", "craft-plan.json"), JSON.stringify({ type: "industry spot", route: "film", style: "none",
    reference: "none", stage, locked: false, style_needs: styleNeeds, style_never: [], rows, exemptions }, null, 1));
  if (state) writeFileSync(join(dir, "ice", "state.json"), JSON.stringify(state));
  return dir;
}
const swapRow = (rows, code, row) => rows.map((r) => (r.dimension === code ? row : r));

test("craft_gate.py plan: a complete plan passes; a missing code, a banned reason, a style need set to not_use, an unknown where id and an unanswered number each fail", (t) => {
  if (!PYTHON) { if (requirePython) assert.fail("Python 3 not found (set PYTHON)"); t.skip("Python 3 not found"); return; }
  let r = craftPy("plan", craftProject("craft good"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /Verdict: PASS/);

  r = craftPy("plan", craftProject("craft missing", { rows: goodCraftRows().filter((x) => x.dimension !== "foley") }));
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /foley: no row/);

  r = craftPy("plan", craftProject("craft banned", { rows: swapRow(goodCraftRows(), "silence", notUseRow("silence", "Not asked", "user")) }));
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /silence: not_use with a banned reason \("Not asked"\)/);

  r = craftPy("plan", craftProject("craft style need", { styleNeeds: ["depth"],
    rows: swapRow(goodCraftRows(), "depth", notUseRow("depth", "a flat poster look", "type: treatment.md craft plan defaults")) }));
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /depth: not_use although the chosen style needs it/);

  r = craftPy("plan", craftProject("craft where", { rows: swapRow(goodCraftRows(), "camera", useRow("camera", ["S9"])) }));
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /camera: where id\(s\) S9 not found/);

  const script = "| Shot | Time | VO line |\n|---|---|---|\n| 1 | 0-3 | \"Hot coffee at your door in 30 minutes, 40% cheaper.\" |\n";
  r = craftPy("plan", craftProject("craft number", { script, rows: swapRow(goodCraftRows(), "data", notUseRow("data", "a chart would clutter it", "type: treatment.md craft plan defaults")) }));
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /data: not_use, but the content has numbers.*"40%"/);
  r = craftPy("plan", craftProject("craft number named", { script, rows: swapRow(goodCraftRows(), "data", notUseRow("data", "content: 30 minutes and 40% are said by the voice over a held product shot", "content: ice/plan/script.md")) }));
  assert.equal(r.status, 0, r.stdout + r.stderr);

  r = craftPy("plan", join(work, "craft no such folder"));
  assert.equal(r.status, 1, "an unreadable project exits 1");
});

test("craft_gate.py build: a box on the mouth band fails the face check, a box beside the face passes it", { skip: FFMPEG && HAS_CV ? false : "ffmpeg, numpy or opencv missing" }, () => {
  const rows = CRAFT_CODES.map((c) => notUseRow(c, "type policy: not part of this fixture", "type: fixture"));
  const dir = craftProject("craft build", { rows, stage: "07" });
  const film = join(dir, "test clip.mp4");
  const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc=size=640x360:rate=25:duration=3",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", film], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const sample = (key, boxes) => { const f = join(dir, `${key} ${boxes[0][0]}.json`); writeFileSync(f, JSON.stringify([{ t: 1, [key]: boxes, width: 640, height: 360 }])); return f; };
  const faces = sample("faces", [[260, 100, 120, 150]]);

  let r = craftPy("build", dir, "--render", film, "--faces", faces, "--boxes", sample("boxes", [[240, 205, 160, 40]]));
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /\[RED\] +faces: text over a face/);
  assert.match(r.stdout, /mouth and chin band/);
  assert.ok(existsSync(join(dir, "ice", "review", "craft-gate.json")), "craft-gate.json written");

  r = craftPy("build", dir, "--render", film, "--faces", faces, "--boxes", sample("boxes", [[470, 120, 150, 40]]), "--json");
  const out = JSON.parse(r.stdout);
  assert.equal(out.checks.faces.ok, true, JSON.stringify(out.checks.faces));
  assert.equal(r.status, 0, JSON.stringify(out.reds));

  const m = join(dir, "measure out.json");
  r = craftPy("measure", film, "--out", m);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const measured = JSON.parse(readFileSync(m, "utf8"));
  assert.equal(measured.summary.max_flashes_per_s, 0);
  assert.ok(measured.shots.length >= 1 && measured.shots[0].finish.samples > 0, "per-shot finishing measures");
});

const exRow = (id, extra = {}) => ({ id, lifts: ["lint:C1"], element: "a folio in the corner", source: { kind: "style", ref: "editorial card, Craft needs: type" },
  shots: ["1"], reason: "the style's folio marks the chapter", stage: "05", ...extra });

test("craft_gate.py plan: a malformed exemption row is red, a well-formed one passes", (t) => {
  if (!PYTHON) { if (requirePython) assert.fail("Python 3 not found (set PYTHON)"); t.skip("Python 3 not found"); return; }
  const good = [exRow("X-01"), exRow("X-02", { lifts: ["film:blue_purple_share"], element: "a night sky", source: { kind: "content", ref: "the night scene of script.md" },
    shots: "all", amount: { measure: "blue-purple share", value: "40 %", tolerance: 0.1 } })];
  let r = craftPy("plan", craftProject("craft exemptions good", { exemptions: good }), "--json");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(JSON.parse(r.stdout).exemptions.map((x) => x.problems), [[], []]);

  const bad = [exRow("X-01"),
    exRow("X-03", { lifts: ["film:hero_share"], source: { kind: "content", ref: "the script names the desk first" } }),
    exRow("X-04", { lifts: ["lint:C2"], source: { kind: "content", ref: "a label in the script" }, stage: "07" }),
    exRow("X-05", { lifts: ["truth:claims"] }),
    exRow("X-06", { lifts: "lint:C1" }),
    exRow("X-07", { source: undefined }),
    exRow("X-08", { shots: "some" }),
    exRow("X-09", { lifts: ["colour:G1"] }),
    exRow("X-10", { amount: { value: "many" } }),
    exRow("X-11", { stage: "09" }),
    exRow("X-12", { lifts: ["frame:flash"], source: { kind: "style", ref: "rave card" } }),
    exRow(undefined),
    exRow("X-01", { reason: "" })];
  r = craftPy("plan", craftProject("craft exemptions bad", { exemptions: bad }), "--json");
  assert.equal(r.status, 2, r.stdout + r.stderr);
  const res = JSON.parse(r.stdout);
  assert.deepEqual(res.exemptions[0].problems, [], "the well-formed row stays green");
  const reds = res.reds.join("\n");
  for (const want of [
    /exemption X-03: film:hero_share: a content row cannot lift it \(allowed: user, reference, style\); the gates ignore it for that rule/,
    /exemption X-04: a content row written at stage 07/,
    /exemption X-05: it lifts a never-lifted class \(truth:claims\)/,
    /exemption X-06: "lifts" is not a non-empty list of rule ids/,
    /exemption X-07: it has no source/,
    /exemption X-08: "shots" is the string "some"/,
    /exemption X-09: lifts colour:G1: not a rule id/,
    /exemption X-10: "amount" needs a measure and a value with a number/,
    /exemption X-11: stage "09" is not 04, 05 or 07/,
    /exemption X-12: frame:flash: a style row cannot lift it \(allowed: user\)/,
    /exemption 12: has no id/,
    /exemption X-01: repeats the id of row 1/,
    /exemption X-01: has no reason/]) assert.match(reds, want);

  const camera = { ...useRow("camera", ["film"]), idle_max_s: "4 s" };
  r = craftPy("plan", craftProject("craft idle max", { rows: swapRow(goodCraftRows(), "camera", camera) }));
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /camera: idle_max_s is "4 s": write the longest idle run allowed in a take as a positive number of seconds/);
});

const CV_SKIP = FFMPEG && HAS_CV ? false : "ffmpeg, numpy or opencv missing";
const notUseAll = () => CRAFT_CODES.map((c) => notUseRow(c, "type policy: not part of this fixture", "type: fixture"));

test("craft_gate.py build: a locked take with a graphic every 4 s passes the idle check, a bare 9 s take fails, and the free-text amount is never the limit", { skip: CV_SKIP }, () => {
  const camera = { ...useRow("camera", ["film"]), amount: "2 s per move, eased" };
  const state = { route: "edit", subtype: "talking-head ad", current: "07" };
  const dir = craftProject("craft idle", { rows: swapRow(notUseAll(), "camera", camera), stage: "07", state });
  const film = join(dir, "take.mp4");
  const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=0x6b6b62:s=640x360:rate=25:duration=9",
    "-vf", "drawbox=x=380:y=60:w=160:h=240:color=0x3c2f28:t=fill", "-c:v", "libx264", "-pix_fmt", "yuv420p", film], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const build = (...extra) => {
    const r = craftPy("build", dir, "--render", film, "--json", ...extra);
    assert.ok(r.status === 0 || r.status === 2, r.stdout + r.stderr);
    return JSON.parse(r.stdout).checks.camera;
  };
  const bare = build();
  assert.equal(bare.ok, false, JSON.stringify(bare));
  assert.equal(bare.limit_s, 5, "the speaker-edit default, not the 2 s of the free-text amount: " + bare.limit_from);
  assert.match(bare.limit_from, /speaker-edit default/);
  assert.ok(bare.longest_idle_s >= 8.9, JSON.stringify(bare));
  assert.match(bare.items[0], /sits idle for 9/);

  // a lower third in at 4 s, out at 6 s, and a second one in at 8 s: every idle run is at most 4 s
  const boxes = join(dir, "boxes.json");
  writeFileSync(boxes, JSON.stringify(Array.from({ length: 19 }, (_, i) => i / 2).map((t) => ({ t, width: 640, height: 360,
    boxes: (t >= 4 && t < 6) || t >= 8 ? [[40, 280, 260, 50]] : [] }))));
  const graphic = build("--boxes", boxes);
  assert.equal(graphic.ok, true, JSON.stringify(graphic));
  assert.equal(graphic.longest_idle_s, 4);
  assert.deepEqual(graphic.changes_s, [4, 6, 8]);

  // declared events in <render>.events.json reset the run too (a hold does not)
  writeFileSync(join(dir, "take.events.json"), JSON.stringify({ duration: 9, events: [{ t: 3, kind: "graphic" }, { t: 6, kind: "camera" }, { t: 1, kind: "hold", end: 2.5 }] }));
  const declared = build();
  assert.equal(declared.ok, true, JSON.stringify(declared));
  assert.equal(declared.longest_idle_s, 3);
  assert.ok(declared.changes_from.some((s) => s.includes("take.events.json")), JSON.stringify(declared.changes_from));
  rmSync(join(dir, "take.events.json"));

  // the camera row's idle_max_s is the limit when it is given
  craftProject("craft idle", { rows: swapRow(notUseAll(), "camera", { ...camera, idle_max_s: 3 }), stage: "07", state });
  const strict = build("--boxes", boxes);
  assert.equal(strict.limit_s, 3);
  assert.match(strict.limit_from, /idle_max_s/);
  assert.equal(strict.ok, false, JSON.stringify(strict));
});

test("craft_gate.py build: a user frame:flash row lifts only the flash windows inside its shots and within its amount", { skip: CV_SKIP }, () => {
  const dir = craftProject("craft flash", { rows: notUseAll(), stage: "07" });
  const film = join(dir, "strobe.mp4");
  const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=gray:s=320x180:rate=25:duration=9",
    "-vf", "drawbox=x=0:y=0:w=iw:h=ih:color=white:t=fill:enable='(between(t,1,2)+between(t,6,7))*lt(mod(t,0.2),0.1)'",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", film], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const user = (id, extra) => ({ id, lifts: ["frame:flash"], element: "the club strobe", reason: "the user asked for the strobe as filmed", stage: "05",
    source: { kind: "user", ref: "\"keep the strobe exactly as the clip has it\"" }, ...extra });
  const build = (exemptions) => {
    craftProject("craft flash", { rows: notUseAll(), stage: "07", exemptions });
    const r = craftPy("build", dir, "--render", film, "--json");
    assert.ok(r.status === 0 || r.status === 2, r.stdout + r.stderr);
    return JSON.parse(r.stdout).checks.flashes;
  };
  const none = build([]);
  assert.equal(none.items.length, 2, JSON.stringify(none));
  assert.ok(none.max_per_s > 3, JSON.stringify(none));

  const first = build([user("X-01", { shots: ["0.5-2.5"], amount: { measure: "flashes per second", value: 6, tolerance: 0.1 } })]);
  assert.equal(first.ok, false, "the window outside the row's shots stays red: " + JSON.stringify(first));
  assert.equal(first.items.length, 1, JSON.stringify(first));
  assert.match(first.items[0], /from 6/);
  assert.equal(first.exempt.length, 1, JSON.stringify(first));
  assert.match(first.exempt[0], /^exempt frame:flash by X-01 \(user: "keep the strobe exactly as the clip has it"\): \d+ flashes from 1/);
  assert.ok(first.warnings.some((w) => /faithful strobe by the user's words/.test(w)), JSON.stringify(first.warnings));

  const others = build([user("X-02", { shots: "all", amount: { measure: "flashes per second", value: 2 } }),
    { ...user("X-03", { shots: "all" }), source: { kind: "style", ref: "rave card" } }]);
  assert.equal(others.items.length, 2, "over the row's amount, and a style row, lift nothing: " + JSON.stringify(others));
  assert.deepEqual(others.exempt, []);
  assert.ok(others.warnings.some((w) => /exemption X-03 lifts frame:flash but is ignored \(a style row cannot lift it \(allowed: user\)\)/.test(w)), JSON.stringify(others.warnings));
});

// ---------------------------------------------------------------- craft_gate.py 0.2.6 (package G2): depth from pixels,
// finishing per shot, grade per source class, fixed marks and the speaker. Frames are drawn with numpy and opencv and
// piped to ffmpeg (no network); `frame(i, t)` returns one BGR frame, `blocks()` a picture of random flat blocks.
const GEN = String.raw`
import sys, subprocess, numpy as np, cv2
out, W, H, FPS, DUR, audio, body = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), sys.argv[6], sys.argv[7]
def blocks(w, h, cell, lo=30, hi=225, seed=1, ch=3):
    r = np.random.default_rng(seed)
    small = r.integers(lo, hi, (h // cell + 1, w // cell + 1, ch), dtype=np.uint8)
    return cv2.resize(small, ((w // cell + 1) * cell, (h // cell + 1) * cell), interpolation=cv2.INTER_NEAREST).reshape((h // cell + 1) * cell, (w // cell + 1) * cell, ch)[:h, :w].copy()
exec(body)
cmd = ["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-"]
if audio: cmd += ["-f", "lavfi", "-i", audio]
cmd += ["-map", "0:v"] + (["-map", "1:a", "-c:a", "aac"] if audio else []) + ["-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", "-t", str(DUR), out]
p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for i in range(int(round(DUR * FPS))):
    p.stdin.write(np.ascontiguousarray(np.clip(frame(i, i / FPS), 0, 255), dtype=np.uint8).tobytes())
p.stdin.close()
sys.exit(p.wait())
`;
function drawVideo(file, body, { w = 640, h = 360, fps = 25, dur = 4, audio = "" } = {}) {
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", GEN, file, String(w), String(h), String(fps), String(dur), audio, body],
    { encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  return file;
}
const writeShots = (dir, data) => writeFileSync(join(dir, "ice", "plan", "shots.json"), JSON.stringify(data, null, 1));
const craftBuild = (dir, film, ...extra) => {
  const r = craftPy("build", dir, "--render", film, "--json", ...extra);
  assert.ok(r.status === 0 || r.status === 2, r.stdout + r.stderr);
  return JSON.parse(r.stdout);
};

test("craft_gate.py measure: a parallax pan (a near band three times faster than its ground) writes 2 planes to <video>.depth.json for motion_check.py; a flat pan of one picture writes 1 plane", { skip: CV_SKIP }, () => {
  const dir = join(work, "craft depth");
  mkdirSync(dir, { recursive: true });
  const parallax = drawVideo(join(dir, "parallax.mp4"), [
    "BG = blocks(1400, 360, 12, seed=1)", "FG = blocks(2400, 120, 12, 0, 255, seed=2)",
    "def frame(i, t):", "    f = BG[:, 2 * i:2 * i + W].copy()", "    f[240:360] = FG[:, 6 * i:6 * i + W]", "    return f"].join("\n"));
  const flat = drawVideo(join(dir, "flat pan.mp4"), ["BG = blocks(1400, 360, 12, seed=1)",
    "def frame(i, t):", "    return BG[:, 3 * i:3 * i + W].copy()"].join("\n"));
  writeFileSync(join(dir, "parallax.depth.json"), JSON.stringify({ layers: 9, elements_3d: ["card stack"], dof: { present: true, blur_px: 4 }, triggers: [] }));

  let r = craftPy("measure", parallax, "--out", join(dir, "parallax measure.json"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const deep = JSON.parse(readFileSync(join(dir, "parallax.depth.json"), "utf8"));
  assert.equal(deep.layers, 2, JSON.stringify(deep.measured));
  assert.ok(deep.parallax_ratio >= 2.4 && deep.parallax_ratio <= 3.6, `parallax ratio ${deep.parallax_ratio}`);
  assert.equal(deep.push_through, 0);
  assert.equal(deep.camera_moving_share, 1);
  assert.deepEqual(deep.elements_3d, ["card stack"], "elements_3d written by hand are kept");
  assert.equal(deep.dof.present, true, "dof written by hand is kept");

  r = craftPy("measure", flat, "--out", join(dir, "flat measure.json"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const one = JSON.parse(readFileSync(join(dir, "flat pan.depth.json"), "utf8"));
  assert.equal(one.layers, 1, JSON.stringify(one.measured));
  assert.equal(one.parallax_ratio, null);

  // motion_check.py reads the file craft_gate.py wrote, beside the render
  const ref = join(dir, "reference depth.json");
  writeFileSync(ref, JSON.stringify({ camera_moving_share: 1, layers: 2, parallax_ratio: 3, push_through: 0, elements_3d: [], dof: { present: false } }));
  const motion = (video) => spawnSync(PYTHON[0], [...PYTHON.slice(1), abs("skills/ice-qa/scripts/motion_check.py"), video, "--pacing-only",
    "--reference-depth", ref], { encoding: "utf8", timeout: 120000 });
  r = motion(parallax);
  assert.match(r.stdout + r.stderr, /depth: PASS/);
  r = motion(flat);
  assert.match(r.stdout + r.stderr, /depth: FAIL/);
  assert.match(r.stdout + r.stderr, /parallax_ratio: the reference has 3, the film has none/);
});

test("craft_gate.py build: grain where the finish row names it passes; grain on a shot the row does not name is red, and the named shot without grain is red", { skip: CV_SKIP }, () => {
  const finish = (where) => ({ ...useRow("finish", where), devices: ["film grain"] });
  const dir = craftProject("craft finishing", { rows: swapRow(notUseAll(), "finish", finish(["0-3"])), stage: "07" });
  const film = drawVideo(join(dir, "two shots.mp4"), [
    "rng = np.random.default_rng(3)",
    "def frame(i, t):",
    "    if t < 3:",
    "        f = np.full((H, W, 3), 122, np.float32)",
    "        f[150:210, 80:200] = 40",
    "        return f + rng.normal(0, 7, (H, W, 1))",
    "    f = np.zeros((H, W, 3), np.uint8); f[:] = (150, 190, 215)",
    "    f[60:300, 380:560] = (60, 70, 90)",
    "    return f"].join("\n"), { dur: 6 });

  let out = craftBuild(dir, film);
  assert.equal(out.checks.finishing.ran, true);
  assert.equal(out.checks.finishing.ok, true, JSON.stringify(out.checks.finishing));

  craftProject("craft finishing", { rows: swapRow(notUseAll(), "finish", finish(["3-6"])), stage: "07" });
  out = craftBuild(dir, film);
  const items = out.checks.finishing.items.join("\n");
  assert.equal(out.checks.finishing.ok, false, JSON.stringify(out.checks.finishing));
  assert.match(items, /grain [\d.]+ on \S+ \(0-3 s\), which neither the finish row nor shots\.json names/);
  assert.match(items, /grain is named on \S+ \(3-6 s\) but measures [\d.]+ \(not above the floor 1\)/);
  assert.ok(out.reds.some((x) => x.startsWith("finishing: ")), JSON.stringify(out.reds));
});

test("craft_gate.py build: an archive source class graded outside_mono is red in colour and passes in monochrome against the film's own colour world", { skip: CV_SKIP }, () => {
  const dir = craftProject("craft grade", { rows: notUseAll(), stage: "07" });
  writeShots(dir, { shots: [{ id: "S1", start_s: 0, end_s: 3 }, { id: "S2", start_s: 3, end_s: 6, source_class: "archive", grade: "outside_mono" }] });
  const body = (grey) => ["OWN = blocks(W, H, 40, seed=4)", "ARC = blocks(W, H, 24, seed=5)",
    `ARC = cv2.cvtColor(cv2.cvtColor(ARC, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR) if ${grey ? "True" : "False"} else ARC`,
    "def frame(i, t):", "    return OWN if t < 3 else ARC"].join("\n");

  let out = craftBuild(dir, drawVideo(join(dir, "archive colour.mp4"), body(false), { dur: 6 }));
  const grade = out.checks.grade;
  assert.equal(grade.ok, false, JSON.stringify(grade));
  assert.equal(grade.classes_from, "the edit plan or shots.json");
  assert.match(grade.items.join("\n"), /\(3-6 s\) \(class archive, grade outside_mono\) is not inside its planned look, monochrome/);

  out = craftBuild(dir, drawVideo(join(dir, "archive mono.mp4"), body(true), { dur: 6 }));
  assert.equal(out.checks.grade.ok, true, JSON.stringify(out.checks.grade));
  assert.ok(out.checks.grade.own.saturation > 0.2, JSON.stringify(out.checks.grade.own));
});

test("craft_gate.py build: a fixed mark in its slot over a moving camera passes; a mark that rides the camera, sits 3 percent off its slot or goes missing for 1.2 s is red", { skip: CV_SKIP }, () => {
  const dir = craftProject("craft marks", { rows: notUseAll(), stage: "07" });
  writeShots(dir, { fixed_marks: [{ mark: "corner logo", x_pct: 80, y_pct: 5, w_pct: 12, file: "logo.png" }] });
  const logo = ["LOGO = np.zeros((40, 120, 3), np.uint8); LOGO[:] = (70, 30, 20)",
    "cv2.rectangle(LOGO, (2, 2), (117, 37), (255, 255, 255), 2)",
    "cv2.putText(LOGO, 'ICE', (22, 31), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 3)"].join("\n");
  const save = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", `import numpy as np, cv2, sys\n${logo}\ncv2.imwrite(sys.argv[1], LOGO)`, join(dir, "logo.png")], { encoding: "utf8" });
  assert.equal(save.status, 0, save.stderr);
  const body = (x, rides, gap) => [logo, "BG = blocks(1400, 360, 16, 40, 200, seed=6)",
    "M = cv2.resize(LOGO, (77, 26), interpolation=cv2.INTER_AREA)",
    "def frame(i, t):", "    f = BG[:, 2 * i:2 * i + W].copy()",
    `    if ${gap ? "not 2.0 <= t < 3.2" : "True"}:`,
    `        x = ${x} - ${rides ? "2 * i // 3" : "0"}`, "        f[18:44, x:x + 77] = M", "    return f"].join("\n");
  const marks = (name, ...args) => craftBuild(dir, drawVideo(join(dir, `${name}.mp4`), body(...args))).checks.marks;

  let mk = marks("in its slot", 512, false, false);
  assert.equal(mk.ok, true, JSON.stringify(mk));
  assert.equal(mk.marks[0].template, "its file");
  assert.ok(mk.marks[0].found >= mk.marks[0].samples - 1, JSON.stringify(mk.marks[0]));

  mk = marks("rides the camera", 512, true, false);
  assert.equal(mk.ok, false, JSON.stringify(mk));
  assert.match(mk.items.join("\n"), /mark 1 \(corner logo\) moves by [\d.]+% of the frame across its range/);

  mk = marks("off its slot", 493, false, false);
  assert.equal(mk.ok, false, JSON.stringify(mk));
  assert.match(mk.items.join("\n"), /mark 1 \(corner logo\) sits at x 77\.\d%, y 5\.\d%; its slot is x 80\.0%, y 5\.0% \(more than 2 percent of the frame off\)/);

  mk = marks("missing a while", 512, false, true);
  assert.equal(mk.ok, false, JSON.stringify(mk));
  assert.match(mk.items.join("\n"), /mark 1 \(corner logo\) is missing from its slot 2(\.\d+)?-3(\.\d+)? s/);
});

test("craft_gate.py build: inside a recede window a speaker dimmed while speaking or dimmed 30 percent while silent is red; a scale back with partial desaturation while speaking and a 10 percent dim while silent pass", { skip: CV_SKIP }, () => {
  const cutout = { ...notUseRow("cutout", "type policy: not part of this fixture", "type: fixture"), recede_windows: [{ start: 3, end: 7 }] };
  const dir = craftProject("craft speaker", { rows: swapRow(notUseAll(), "cutout", cutout), stage: "07" });
  // a voice from 0 to 5 s (syllables of 0.15 s every 0.25 s), silence after
  const voice = "aevalsrc='if(lt(t,5),if(lt(mod(t,0.25),0.15),0.4*sin(2*PI*300*t)+0.3*sin(2*PI*1200*t),0),0)':s=16000:d=10";
  const faceBox = (scale) => { const w = 120 * scale, h = 150 * scale; return [320 - w / 2, 175 - h / 2, w, h]; };
  const facesFile = (name, scaleBack) => {
    const f = join(dir, `${name} faces.json`);
    writeFileSync(f, JSON.stringify(Array.from({ length: 51 }, (_, i) => i / 5).map((t) => ({ t, width: 640, height: 360,
      faces: [faceBox(scaleBack && t >= 3 && t < 7 ? 0.8 : 1)] }))));
    return f;
  };
  const body = (speaking, silent, scaleBack) => ["BG = blocks(W, H, 40, 90, 130, seed=8)",
    "FACE = blocks(120, 150, 6, 0, 80, seed=9, ch=1).astype(np.float32) + np.array([110, 140, 190], np.float32) - 40",
    "def frame(i, t):",
    "    f = BG.astype(np.float32)",
    `    back = ${scaleBack ? "True" : "False"} and 3 <= t < 7`,
    "    s = 0.8 if back else 1.0",
    "    face = cv2.resize(FACE, (int(round(120 * s)), int(round(150 * s))), interpolation=cv2.INTER_NEAREST)",
    "    if back: face = face * 0.6 + face.mean(axis=2, keepdims=True) * 0.4",
    `    if 3 <= t < 5: face = face * ${speaking}`,
    `    if 5.4 <= t < 7: face = face * ${silent}`,
    "    h, w = face.shape[:2]; y, x = int(round(175 - h / 2)), int(round(320 - w / 2))",
    "    f[y:y + h, x:x + w] = face",
    "    return f"].join("\n");
  const run = (name, speaking, silent, scaleBack) => craftBuild(dir,
    drawVideo(join(dir, `${name}.mp4`), body(speaking, silent, scaleBack), { dur: 10, audio: voice }),
    "--faces", facesFile(name, scaleBack)).checks.speaker;

  const dimmed = run("dimmed", 0.7, 0.7, false);
  assert.equal(dimmed.ran, true, JSON.stringify(dimmed));
  assert.equal(dimmed.ok, false, JSON.stringify(dimmed));
  const items = dimmed.items.join("\n");
  assert.match(items, /the speaker is dimmed over 5 percent inside a recede window while speaking from 3/);
  assert.match(items, /the speaker is dimmed over 15 percent inside a recede window while silent from 5\.[4-6]/);
  assert.ok(dimmed.voice_spans.length >= 1 && dimmed.voice_spans.at(-1)[1] <= 5.4, JSON.stringify(dimmed.voice_spans));

  const receded = run("receded", 1, 0.9, true);
  assert.equal(receded.ran, true, JSON.stringify(receded));
  assert.equal(receded.ok, true, JSON.stringify(receded));
});
