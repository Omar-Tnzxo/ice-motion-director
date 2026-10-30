#!/usr/bin/env node
// gates.mjs: every repository check in one local command. It replaces hosted CI (founder decision, 2026-10-22):
// the git pre-push hook in .githooks/ runs it, and a push goes out only when it passes.
// Original to Ice Motion Director (Apache-2.0). Zero dependencies, Node 22 or newer.
//
//   node scripts/gates.mjs              the test suite and `claude plugin validate --strict .`
//   node scripts/gates.mjs --python     also: install every skill's requirements.txt (binary wheels only) into a
//                                       cached virtual environment and import each pinned package in its own process
//   node scripts/gates.mjs --render     also: render one second with render-html.mjs, using the pinned
//                                       playwright-core in a cached scratch project (needs npm, Chrome, network)
//   node scripts/gates.mjs --all        both of the above (run it after `node scripts/freshness.mjs bump`)
//   --no-validate                       skip the plugin validation when the `claude` command is not installed;
//                                       the summary says so, so a skipped gate never reads as a pass
//
// The suite runs at most ICE_TEST_CONCURRENCY test files at once (default 2). Node's default runs one per CPU core,
// which on a machine near its memory commit limit dies in unrelated tests (VirtualAlloc failed, 0xC000012D). Set
// ICE_TEST_CONCURRENCY=1 for a fully serial run, or higher on a machine with memory to spare.
//
// Exit codes: 0 every gate that ran passed, 1 a gate failed, 2 usage error.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WIN = process.platform === "win32";
const KNOWN = new Set(["--python", "--render", "--all", "--no-validate", "-h", "--help"]);
const args = process.argv.slice(2);
const unknown = args.filter((a) => !KNOWN.has(a));
if (unknown.length || args.includes("-h") || args.includes("--help")) {
  console.log("usage: node scripts/gates.mjs [--python] [--render] [--all] [--no-validate]");
  process.exit(unknown.length ? 2 : 0);
}
const ALL = args.includes("--all");
const WANT_PYTHON = ALL || args.includes("--python");
const WANT_RENDER = ALL || args.includes("--render");
const VALIDATE = !args.includes("--no-validate");

// Import names of every pinned Python package (the pins live in skills/ice-engines/references/versions.json "pip").
const PYTHON_IMPORTS = ["numpy", "scipy", "soundfile", "numba", "pedalboard", "pyloudnorm", "matplotlib",
  "librosa", "cv2", "PIL", "playwright", "scenedetect", "vtracer"];

const CACHE = join(tmpdir(), "ice-motion-director-gates");
const results = [];
const record = (name, status, detail = "") => results.push({ name, status, detail });

// A shell only for npm-style command shims on Windows (claude, npm), whose arguments here are plain words; every
// other program, Python included, runs without a shell so its arguments reach it unsplit.
function run(cmd, cmdArgs, opts = {}) {
  return spawnSync(cmd, cmdArgs, { cwd: ROOT, stdio: "inherit", shell: false, ...opts });
}
function quiet(cmd, cmdArgs, opts = {}) {
  return spawnSync(cmd, cmdArgs, { cwd: ROOT, encoding: "utf8", shell: false, ...opts });
}
const shim = { shell: WIN };
const has = (cmd) => quiet(cmd, ["--version"], shim).status === 0;

function findPython() {
  for (const c of [process.env.PYTHON, "python3", "python", WIN ? "py" : ""].filter(Boolean)) {
    const r = quiet(c, ["-c", "import sys; print(sys.version_info[:2] >= (3, 11))"]);
    if (r.status === 0 && r.stdout.trim() === "True") return c;
  }
  return "";
}

// ---------------------------------------------------------------- 1. tests
function gateTests(python) {
  // CI=1 makes the Python-dependent tests fail instead of skipping when Python is present.
  const env = { ...process.env, ...(python ? { CI: "1", PYTHON: python } : {}) };
  const jobs = Math.max(1, Number.parseInt(process.env.ICE_TEST_CONCURRENCY ?? "", 10) || 2);
  const r = run(process.execPath, ["--test", `--test-concurrency=${jobs}`, "tests/*.test.mjs"], { env });
  record("tests", r.status === 0 ? "pass" : "fail", python ? "" : "no Python 3.11 or newer found: Python tests skipped");
}

// ---------------------------------------------------------------- 2. plugin manifest
function gateValidate() {
  if (!VALIDATE) return record("claude plugin validate --strict", "skipped", "--no-validate");
  if (!has("claude")) return record("claude plugin validate --strict", "fail", "the claude command is not installed (pass --no-validate to skip it on purpose)");
  const r = run("claude", ["plugin", "validate", "--strict", "."], shim);
  record("claude plugin validate --strict", r.status === 0 ? "pass" : "fail");
}

// ---------------------------------------------------------------- 3. Python pins
function gatePython(python) {
  if (!python) return record("python pins", "fail", "no Python 3.11 or newer found");
  const venv = join(CACHE, "venv");
  const vpy = WIN ? join(venv, "Scripts", "python.exe") : join(venv, "bin", "python");
  if (!existsSync(vpy)) {
    mkdirSync(CACHE, { recursive: true });
    if (run(python, ["-m", "venv", venv]).status !== 0) return record("python pins", "fail", "could not create the virtual environment");
  }
  const reqs = readdirSync(join(ROOT, "skills"))
    .map((s) => join("skills", s, "scripts", "requirements.txt"))
    .filter((f) => existsSync(join(ROOT, f)))
    .flatMap((f) => ["-r", f]);
  const install = run(vpy, ["-m", "pip", "install", "--disable-pip-version-check", "--only-binary=:all:", ...reqs]);
  if (install.status !== 0) return record("python pins", "fail", "pip could not install every pin from binary wheels");
  // One process per package, so a crash (for example SIGILL from a wheel built for newer CPUs) names its package.
  const broken = PYTHON_IMPORTS.filter((m) => quiet(vpy, ["-c", `import ${m}`]).status !== 0);
  record("python pins", broken.length ? "fail" : "pass", broken.length ? `import failed: ${broken.join(", ")}` : `${PYTHON_IMPORTS.length} packages import`);
}

// ---------------------------------------------------------------- 4. render smoke
function gateRender() {
  if (!has("npm")) return record("render smoke", "fail", "npm is not installed");
  const versions = JSON.parse(readFileSync(join(ROOT, "skills/ice-engines/references/versions.json"), "utf8"));
  const pin = versions.npm["playwright-core"].version;
  const project = join(CACHE, "render project");
  mkdirSync(project, { recursive: true });
  const pkg = join(project, "package.json");
  if (!existsSync(pkg)) writeFileSync(pkg, '{"private":true}\n');
  const installed = join(project, "node_modules", "playwright-core", "package.json");
  const current = existsSync(installed) ? JSON.parse(readFileSync(installed, "utf8")).version : "";
  if (current !== pin && run("npm", ["install", "--save-exact", "--no-audit", "--no-fund", `playwright-core@${pin}`], { cwd: project, ...shim }).status !== 0) {
    return record("render smoke", "fail", `npm could not install playwright-core@${pin}`);
  }
  const env = { ...process.env, ICE_RENDER_SMOKE_PROJECT: project };
  const r = run(process.execPath, ["--test", "--test-name-pattern=render-html", "tests/scripts.test.mjs"], { env });
  record("render smoke", r.status === 0 ? "pass" : "fail", `playwright-core@${pin}`);
}

// ---------------------------------------------------------------- 5. freshness age (founder decision, 2026-10-30)
// A warning, never a fail: the last complete `node scripts/freshness.mjs check` is older than FRESH_DAYS days.
const FRESH_DAYS = 30;
function gateFreshness() {
  const v = JSON.parse(readFileSync(join(ROOT, "skills/ice-engines/references/versions.json"), "utf8"));
  const last = v.last_checked || v.last_verified || "";
  const age = last ? Math.floor((Date.now() - Date.parse(last)) / 86400000) : null;
  if (age === null || age > FRESH_DAYS) record("freshness", "warn", `last version check ${last || "never"}${age === null ? "" : ` (${age} days)`}: run node scripts/freshness.mjs check`);
  else record("freshness", "pass", `last version check ${last} (${age} days)`);
}

const python = findPython();
gateFreshness();
gateTests(python);
gateValidate();
if (WANT_PYTHON) gatePython(python);
if (WANT_RENDER) gateRender();

console.log("\nGates:");
for (const g of results) console.log(`  ${g.status.toUpperCase().padEnd(7)} ${g.name}${g.detail ? `: ${g.detail}` : ""}`);
if (!WANT_PYTHON || !WANT_RENDER) console.log("  (run with --all after a version bump: Python pins and the render smoke run only on request)");
process.exit(results.some((g) => g.status === "fail") ? 1 : 0);
