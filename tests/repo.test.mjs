// Repository hygiene for the marketplaces (sizes, counts, file types, names), relative Markdown links and the
// dash rule. Run: node --test tests/
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { posix } from "node:path";
import { test } from "node:test";
import { abs, extOf, isLegalText, isSymlink, isText, markdownLinks, readText, repoFiles } from "./helpers.mjs";

const WARN_FILES = 512;
const MAX_FILES = 600;
const MAX_FILE = 5 * 1024 * 1024;
const MAX_TEXT = 256 * 1024;
const MAX_PATH = 180; // relative path length; the plugin is installed under deep folders on Windows (260 limit)
const IMAGE_FONT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "woff", "woff2", "ttf", "otf"]);
const FORBIDDEN_EXT = new Set(["mp4", "mov", "m4v", "avi", "mkv", "webm", "zip", "7z", "rar", "gz", "tgz", "pdf", "ico", "exe",
  "dll", "so", "dylib", "bin", "msi", "dmg", "jar", "apk", "pyc"]);
const FORBIDDEN_NAMES = new Set([".ds_store", "thumbs.db", "desktop.ini", ".npmrc", ".yarnrc", ".yarnrc.yml", ".app.json", ".mcp.json"]);
const DEVICE = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

const files = repoFiles();

// Budget (AGENTS.md size limits): aim for WARN_FILES or fewer; up to MAX_FILES is accepted for the stage commands.
test(`at most ${MAX_FILES} files ship (warning above ${WARN_FILES})`, (t) => {
  assert.ok(files.length <= MAX_FILES, `${files.length} files; the budget is ${MAX_FILES} at most`);
  if (files.length > WARN_FILES) t.diagnostic(`warning: ${files.length} files; the Anthropic portal holds plugins above ${WARN_FILES} for a manual review, merge small files`);
});

// Paths the router and its step-mode file name in backticks must exist, so an agent never opens a missing file.
test("reference files named in the router exist", () => {
  const problems = [];
  const router = "skills/ice-motion-director";
  for (const f of files.filter((x) => x.startsWith(`${router}/`) && x.endsWith(".md"))) {
    readText(f).split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(/`(references\/[a-z0-9/-]+\.md)`/g)) {
        if (existsSync(abs(`${router}/${m[1]}`))) continue;
        // A path that belongs to another skill counts when that skill is named on the same line.
        const owners = [...line.matchAll(/`(ice-[a-z0-9-]+)`|\b(ice-[a-z0-9-]+)\b/g)].map((x) => x[1] ?? x[2]);
        if (!owners.some((s) => existsSync(abs(`skills/${s}/${m[1]}`)))) problems.push(`${f}:${i + 1}: \`${m[1]}\` does not exist`);
      }
    });
  }
  assert.deepEqual(problems, []);
});

test("file sizes: every file under 5 MiB, every non-image, non-font file under 256 KiB", () => {
  const problems = [];
  for (const f of files) {
    const size = statSync(abs(f)).size;
    if (size > MAX_FILE) problems.push(`${f}: ${(size / 1048576).toFixed(1)} MiB`);
    else if (!IMAGE_FONT.has(extOf(f)) && size > MAX_TEXT) problems.push(`${f}: ${(size / 1024).toFixed(0)} KiB (non-image files are held above 256 KiB)`);
  }
  assert.deepEqual(problems, []);
});

test("no videos, archives, PDFs, icons, executables, OS junk, registry configs, hooks or MCP config", () => {
  const problems = [];
  for (const f of files) {
    const base = posix.basename(f).toLowerCase();
    if (FORBIDDEN_EXT.has(extOf(f))) problems.push(`${f}: .${extOf(f)} files are not allowed (media goes to Releases or user-attachments)`);
    if (FORBIDDEN_NAMES.has(base)) problems.push(`${f}: not allowed in the plugin`);
    if (f.split("/").includes("__MACOSX")) problems.push(`${f}: __MACOSX folder`);
    if (/^hooks\/|\/hooks\/hooks\.json$|^\.claude\/settings(\.local)?\.json$/.test(f)) problems.push(`${f}: hooks or agent settings do not ship`);
  }
  const rootHasPkg = files.includes("package.json");
  const rootHasLock = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock"].some((l) => files.includes(l));
  if (rootHasPkg && rootHasLock) problems.push("package.json plus a lockfile at the plugin root is held for review");
  if (files.includes(".gitattributes")) {
    const ga = readText(".gitattributes");
    if (/export-ignore|export-subst|\bfilter=/.test(ga)) problems.push(".gitattributes uses export-ignore, export-subst or a filter");
  }
  assert.deepEqual(problems, []);
});

test("file names work on Windows, macOS and Linux", () => {
  const problems = [];
  const seen = new Map();
  for (const f of files) {
    if (f.length > MAX_PATH) problems.push(`${f}: path is ${f.length} characters (max ${MAX_PATH})`);
    for (const part of f.split("/")) {
      if (/[<>:"\\|?*\u0000-\u001f]/.test(part)) problems.push(`${f}: "${part}" has a character Windows forbids`);
      if (/[. ]$/.test(part)) problems.push(`${f}: "${part}" ends with a dot or space`);
      if (DEVICE.test(part)) problems.push(`${f}: "${part}" is a Windows device name`);
    }
    const key = f.toLowerCase();
    if (seen.has(key)) problems.push(`${f} and ${seen.get(key)} differ only by case`);
    seen.set(key, f);
    if (isSymlink(f)) problems.push(`${f}: symlinks are not allowed`);
  }
  assert.deepEqual(problems, []);
});

test("no em dash or en dash characters (license texts exempt)", () => {
  const problems = [];
  for (const f of files) {
    if (isLegalText(f) || !isText(f)) continue;
    readFileSync(abs(f), "utf8").split(/\r?\n/).forEach((line, i) => {
      if (/^\s*(>\s*)?Required Notice:/.test(line)) return;
      const col = line.search(/[\u2013\u2014]/);
      if (col >= 0) problems.push(`${f}:${i + 1}:${col + 1} ${JSON.stringify(line.slice(Math.max(0, col - 30), col + 30))}`);
    });
  }
  assert.deepEqual(problems, []);
});

// Folders named vendor/ hold verbatim third-party copies under their own license; their links point into the
// upstream repository and are not ours to rewrite, so they are skipped here.
test("relative links in every Markdown file resolve (vendor/ copies excepted)", () => {
  const problems = [];
  const lower = new Set(files.map((f) => f.toLowerCase()));
  for (const f of files.filter((x) => /\.md$/i.test(x) && !x.split("/").includes("vendor"))) {
    for (const { target, line } of markdownLinks(readText(f))) {
      let p = target.split("#")[0].split("?")[0];
      if (!p) continue;
      try { p = decodeURI(p); } catch { /* keep the raw target */ }
      const resolved = p.startsWith("/") ? p.slice(1) : posix.normalize(posix.join(posix.dirname(f), p));
      if (resolved.startsWith("..")) { problems.push(`${f}:${line} ${target} points outside the repository`); continue; }
      const clean = resolved.replace(/\/$/, "");
      const exists = existsSync(abs(clean)) && files.some((x) => x === clean || x.startsWith(clean + "/"));
      if (!exists) {
        const hint = lower.has(clean.toLowerCase()) ? " (exists with different letter case; Linux is case sensitive)" : "";
        problems.push(`${f}:${line} ${target}${hint}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

// The router's "Stops" table (ice-motion-director/SKILL.md section 5) is the only list of user stops; every other file
// that mentions it must name where it is, so an agent can always open it.
test("every pointer to the router's stops names its location", () => {
  const problems = [];
  const router = /^skills\/ice-motion-director\/SKILL\.md$/;
  for (const f of files.filter((x) => (x.startsWith("skills/") || x.startsWith("commands/")) && /\.(md|toml)$/.test(x) && !router.test(x))) {
    readText(f).split(/\r?\n/).forEach((line, i) => {
      if (/router's stops/i.test(line) && !/ice-motion-director\/SKILL\.md` section 5, "Stops"/.test(line)) problems.push(`${f}:${i + 1}`);
    });
  }
  assert.deepEqual(problems, []);
});

// Antigravity loads only the first 24,000 bytes of a SKILL.md; anything past that is silently lost. Detail belongs in
// the skill's reference files behind a "Read when ..." pointer.
const MAX_SKILL_MD = 24000;
test(`every SKILL.md is at most ${MAX_SKILL_MD} bytes`, () => {
  const problems = files.filter((f) => /^skills\/[^/]+\/SKILL\.md$/.test(f))
    .map((f) => [f, statSync(abs(f)).size])
    .filter(([, size]) => size > MAX_SKILL_MD)
    .map(([f, size]) => `${f}: ${size} bytes`);
  assert.deepEqual(problems, []);
});
