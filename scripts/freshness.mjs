#!/usr/bin/env node
// Version freshness for skills/ice-engines/references/versions.json. Zero dependencies, Node 22 or newer.
//
//   node scripts/freshness.mjs check [--json]             compare every pin with the npm registry and PyPI
//   node scripts/freshness.mjs bump [--summary FILE]      write the newer pins into versions.json, every
//                                                         requirements.txt and every exact pin in skills/
//                                                         (name@x.y.z, name==x.y.z); FILE gets a Markdown summary
//   node scripts/freshness.mjs stale-specs [--json]       platform specs whose last_verified is older than
//                                                         max_age_days (or never verified)
//
// Rules: npm takes the "latest" dist-tag unless its engines.node excludes the Node minimum. PyPI takes the newest
// final release (no pre-releases, not yanked) whose Requires-Python admits the Python minimum and that has wheels
// for that Python on Windows, macOS and Linux (or a pure-Python wheel). Major bumps are flagged in the summary.
// An entry with a "hold" field (the reason) is reported but never bumped.
// Run by hand before a release (no hosted CI); prove a bump with node scripts/gates.mjs --all, then review the diff.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERSIONS = join(ROOT, "skills", "ice-engines", "references", "versions.json");
const [cmd = "check", ...rest] = process.argv.slice(2);
const flag = (name) => rest.includes(`--${name}`);
const option = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };

if (flag("help") || cmd === "--help" || cmd === "-h" || !["check", "bump", "stale-specs"].includes(cmd)) {
  const src = readFileSync(fileURLToPath(import.meta.url), "utf8").split(/\r?\n/);
  console.log(src.slice(1, src.findIndex((l, i) => i > 0 && !l.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(["check", "bump", "stale-specs"].includes(cmd) || cmd === "--help" || cmd === "-h" ? 0 : 2);
}

const versions = JSON.parse(readFileSync(VERSIONS, "utf8"));
const today = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- version helpers
const parts = (v) => String(v).split(/[.+-]/).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
function cmpVersion(a, b) {
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const p = x[i] ?? 0, q = y[i] ?? 0;
    if (p === q) continue;
    if (typeof p === "number" && typeof q === "number") return p - q;
    return String(p) < String(q) ? -1 : 1;
  }
  return 0;
}
const isMajorBump = (from, to) => {
  const [a, b] = [parts(from), parts(to)];
  return a[0] === 0 && b[0] === 0 ? a[1] !== b[1] : a[0] !== b[0];
};

// PEP 440 specifier check for one Python version, enough for Requires-Python values seen on PyPI.
function admits(spec, py) {
  if (!spec) return true;
  return spec.split(",").map((s) => s.trim()).filter(Boolean).every((s) => {
    const m = /^(~=|==|!=|<=|>=|<|>)\s*([0-9][0-9.]*)(\.\*)?$/.exec(s);
    if (!m) return true;
    const [, op, v, star] = m;
    const c = cmpVersion(py, v);
    if (star) {
      const prefix = parts(v); const head = parts(py).slice(0, prefix.length);
      const same = prefix.every((x, i) => x === (head[i] ?? 0));
      return op === "!=" ? !same : same;
    }
    if (op === ">=") return c >= 0;
    if (op === ">") return c > 0;
    if (op === "<=") return c <= 0;
    if (op === "<") return c < 0;
    if (op === "==") return c === 0;
    if (op === "!=") return c !== 0;
    const up = parts(v); up.splice(-1, 1); up[up.length - 1] += 1;
    return c >= 0 && cmpVersion(py, up.join(".")) < 0;
  });
}

function nodeAdmits(engines, min) {
  const m = /^\s*>=\s*v?(\d+(?:\.\d+){0,2})\s*$/.exec(engines ?? "");
  return m ? cmpVersion(min, m[1]) >= 0 : true;
}

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8" } });
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
      return await r.json();
    } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
}

async function latestNpm(name, nodeMin) {
  const d = await getJson(`https://registry.npmjs.org/${name.replace("/", "%2F")}`);
  const latest = d["dist-tags"]?.latest;
  if (latest && nodeAdmits(d.versions?.[latest]?.engines?.node, nodeMin)) return { version: latest };
  const ok = Object.keys(d.versions ?? {}).filter((v) => /^\d+\.\d+\.\d+$/.test(v) && nodeAdmits(d.versions[v].engines?.node, nodeMin));
  ok.sort(cmpVersion);
  return { version: ok.pop() ?? null, note: `latest ${latest} needs Node ${d.versions?.[latest]?.engines?.node}` };
}

function wheelsCover(files, py) {
  const tag = `cp${py.replace(".", "")}`;
  const names = files.map((f) => f.filename);
  if (names.some((n) => /-py3-none-any\.whl$|-py2\.py3-none-any\.whl$/.test(n))) return true;
  if (!names.some((n) => n.endsWith(".whl"))) return true; // sdist-only pure package
  const fits = (n) => n.includes(`-${tag}-`) || /-cp3\d+-abi3-/.test(n) || /-py3-none-/.test(n);
  return ["win_amd64", "macosx", "manylinux"].every((plat) => names.some((n) => fits(n) && n.includes(plat)));
}

async function latestPip(name, pyMin) {
  const d = await getJson(`https://pypi.org/pypi/${name}/json`);
  const candidates = Object.entries(d.releases ?? {})
    .filter(([v, files]) => /^\d+(\.\d+)*$/.test(v) && files.length && files.some((f) => !f.yanked))
    .sort(([a], [b]) => cmpVersion(b, a));
  for (const [v, files] of candidates) {
    const live = files.filter((f) => !f.yanked);
    const rp = live.find((f) => f.requires_python)?.requires_python;
    if (admits(rp, pyMin) && wheelsCover(live, pyMin)) return { version: v, latest: d.info?.version };
  }
  return { version: null, latest: d.info?.version };
}

// ---------------------------------------------------------------- files to rewrite
function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "__pycache__", ".git"].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(md|mjs|cjs|js|py|txt|json|ya?ml|html|toml)$/i.test(e.name) && p !== VERSIONS) acc.push(p);
  }
  return acc;
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

function rewritePins(changes) {
  const touched = [];
  for (const file of walk(join(ROOT, "skills"))) {
    const before = readFileSync(file, "utf8");
    let text = before;
    for (const c of changes) {
      const re = c.kind === "npm"
        ? new RegExp(`(?<![\\w@/.-])${esc(c.name)}@${esc(c.from)}(?![\\w.-]*\\d)`, "g")
        : new RegExp(`(?<![\\w.-])${esc(c.name)}==${esc(c.from)}(?![\\w.]*\\d)`, "gi");
      text = text.replace(re, (m) => m.slice(0, m.length - c.from.length) + c.to);
    }
    if (text !== before) { writeFileSync(file, text); touched.push(relative(ROOT, file).split(sep).join("/")); }
  }
  return touched;
}

// ---------------------------------------------------------------- commands
function staleSpecs() {
  const ps = versions.platform_specs;
  const maxAge = ps.max_age_days;
  const out = [];
  for (const [name, p] of Object.entries(ps.platforms)) {
    const age = p.last_verified ? Math.floor((Date.parse(today) - Date.parse(p.last_verified)) / 86400000) : null;
    if (age === null || age > maxAge) out.push({ platform: name, last_verified: p.last_verified, age_days: age, covers: p.covers, source: ps.source, max_age_days: maxAge });
  }
  return out;
}

async function compare() {
  const nodeMin = versions.runtimes.node.minimum, pyMin = versions.runtimes.python.minimum;
  const rows = [];
  for (const [name, e] of Object.entries(versions.npm)) {
    try {
      const l = await latestNpm(name, nodeMin);
      rows.push({ kind: "npm", name, from: e.version, to: l.version, note: l.note });
    } catch (err) { rows.push({ kind: "npm", name, from: e.version, to: null, note: String(err.message) }); }
  }
  for (const [name, e] of Object.entries(versions.pip)) {
    try {
      const l = await latestPip(name, pyMin);
      const note = l.latest && l.version !== l.latest ? `PyPI latest ${l.latest} does not support Python ${pyMin} on all three OSes` : undefined;
      rows.push({ kind: "pip", name, from: e.version, to: l.version, note });
    } catch (err) { rows.push({ kind: "pip", name, from: e.version, to: null, note: String(err.message) }); }
  }
  return rows.map((r) => {
    const hold = versions[r.kind][r.name].hold;
    const newer = Boolean(r.to && cmpVersion(r.to, r.from) > 0);
    return { ...r, hold, newer: newer && !hold, major: newer && isMajorBump(r.from, r.to), note: hold && newer ? `held: ${hold}` : r.note };
  });
}

if (cmd === "stale-specs") {
  const s = staleSpecs();
  if (flag("json")) console.log(JSON.stringify(s, null, 1));
  else if (!s.length) console.log("every platform spec was verified within max_age_days");
  else for (const x of s) console.log(`${x.platform}: ${x.last_verified ? `last verified ${x.last_verified} (${x.age_days} days)` : "never verified live"}`);
  process.exit(0);
}

const rows = await compare();
if (cmd === "check") {
  // A complete check records its date; scripts/gates.mjs warns when it is older than 30 days (founder decision, 2026-10-30).
  if (!rows.some((r) => !r.to)) {
    const text = readFileSync(VERSIONS, "utf8");
    const dated = /"last_checked": "[^"]*"/.test(text) ? text.replace(/"last_checked": "[^"]*"/, `"last_checked": "${today}"`)
      : text.replace(/("last_verified": "[^"]*",)/, `$1\n  "last_checked": "${today}",`);
    if (dated !== text) writeFileSync(VERSIONS, dated);
  }
  if (flag("json")) console.log(JSON.stringify(rows, null, 1));
  else for (const r of rows) console.log(`${r.kind.padEnd(4)} ${r.name.padEnd(24)} ${r.from.padEnd(12)} ${r.newer ? `-> ${r.to}${r.major ? "  (major)" : ""}` : r.hold && r.to && cmpVersion(r.to, r.from) > 0 ? `${r.to} available` : r.to ? "current" : "lookup failed"}${r.note ? `  [${r.note}]` : ""}`);
  process.exit(rows.some((r) => !r.to) ? 1 : 0);
}

// bump
const changes = rows.filter((r) => r.newer);
for (const c of changes) versions[c.kind][c.name].version = c.to;
const failed = rows.filter((r) => !r.to);
if (!failed.length) versions.last_verified = today;
// Two-space JSON with arrays of strings kept on one line, the layout versions.json is written in.
const pretty = JSON.stringify(versions, null, 2).replace(/\[\n\s*("(?:[^"\\\n]|\\.)*"(?:,\n\s*"(?:[^"\\\n]|\\.)*")*)\n\s*\]/g,
  (_, items) => `[${items.split(/,\n\s*/).join(", ")}]`);
writeFileSync(VERSIONS, pretty + "\n");
const touched = changes.length ? rewritePins(changes) : [];
const summary = [
  `Weekly version check of \`skills/ice-engines/references/versions.json\` on ${today}.`,
  "",
  changes.length ? "| Kind | Package | From | To | Note |\n|---|---|---|---|---|" : "No newer versions.",
  ...changes.map((c) => `| ${c.kind} | ${c.name} | ${c.from} | ${c.to} | ${[c.major ? "**major**: read the changelog" : "", c.note ?? ""].filter(Boolean).join("; ")} |`),
  "",
  ...(failed.length ? ["Lookups that failed (left unchanged):", ...failed.map((f) => `- ${f.kind} ${f.name}: ${f.note}`), ""] : []),
  ...rows.filter((r) => r.hold && r.to && cmpVersion(r.to, r.from) > 0).map((r) => `- held: ${r.kind} ${r.name} stays at ${r.from} (${r.to} available): ${r.hold}`),
  ...(touched.length ? ["Files rewritten:", ...touched.map((t) => `- \`${t}\``), ""] : []),
  "Prose that names a version without an exact pin (for example \"written against 4.0.536\") is not rewritten: search for the old numbers before merging.",
].join("\n");
const summaryFile = option("summary");
if (summaryFile) writeFileSync(summaryFile, summary + "\n");
console.log(summary);
