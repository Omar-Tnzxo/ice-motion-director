// Shared helpers for the repository tests. Zero dependencies: Node 22 or newer, run with `node --test tests/`.
// Contents: repo file listing, text and binary detection, a strict YAML subset parser for SKILL.md frontmatter and
// agents/openai.yaml, Markdown link extraction, and a Python finder for script checks.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const rel = (abs) => relative(ROOT, abs).split(sep).join("/");
export const abs = (relPath) => join(ROOT, ...relPath.split("/"));
export const readText = (relPath) => readFileSync(abs(relPath), "utf8").replace(/^﻿/, "");
export const readJson = (relPath) => JSON.parse(readText(relPath));

// Every file that would ship: tracked plus untracked files that .gitignore does not exclude. Without git, a walk.
let cachedFiles;
export function repoFiles() {
  if (cachedFiles) return cachedFiles;
  try {
    const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, maxBuffer: 1 << 26 });
    cachedFiles = [...new Set(out.toString("utf8").split("\0").filter(Boolean))].filter((f) => existsSync(abs(f))).sort();
  } catch {
    const walk = (dir, acc) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name === ".git" || e.name === "node_modules" || e.name === "__pycache__") continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p, acc); else acc.push(rel(p));
      }
      return acc;
    };
    cachedFiles = walk(ROOT, []).sort();
  }
  return cachedFiles;
}

export const isSymlink = (relPath) => lstatSync(abs(relPath)).isSymbolicLink();

const BINARY_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "ico", "bmp", "tif", "tiff", "woff", "woff2", "ttf", "otf",
  "eot", "mp3", "wav", "flac", "ogg", "m4a", "aac", "mp4", "mov", "webm", "mkv", "avi", "zip", "gz", "tgz", "7z", "rar", "pdf",
  "exe", "dll", "so", "dylib", "bin", "jar", "class", "pyc", "wasm", "npy", "npz"]);
export const extOf = (p) => (p.includes(".") ? p.slice(p.lastIndexOf(".") + 1).toLowerCase() : "");
export function isText(relPath) {
  if (BINARY_EXT.has(extOf(relPath))) return false;
  const buf = readFileSync(abs(relPath));
  return !buf.subarray(0, 8192).includes(0);
}

// Legal texts stay byte-identical to their originals (dashes included) and are exempt from the dash rule.
export function isLegalText(relPath) {
  const base = relPath.split("/").pop();
  return relPath.startsWith("LICENSES/") || /^(licen[cs]e|copying)/i.test(base) || /(^|[._-])notice([._-][^/]*)?\.txt$/i.test(base);
}

export const SKILLS = readdirSync(abs("skills"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(abs(`skills/${d.name}/SKILL.md`)))
  .map((d) => d.name)
  .sort();

// ---------------------------------------------------------------- strict YAML subset
// Supports what skills and Codex metadata use: block mappings, block sequences (of scalars or mappings), block
// scalars (| and > with - or + chomping), single and double quoted scalars, plain scalars and one-line flow
// sequences. Anything a strict parser would reject or silently reinterpret is an error: tabs in indentation,
// duplicate keys, ": " or " #" inside a plain scalar, a plain scalar starting with an indicator character,
// unterminated quotes, anchors, aliases, tags and documents markers.
export class YamlError extends Error {}

export function parseYaml(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const toks = [];
  lines.forEach((raw, i) => {
    if (/^\s*$/.test(raw) || /^\s*#/.test(raw)) { toks.push({ blank: true, raw, n: i + 1 }); return; }
    const m = /^( *)(\t*)/.exec(raw);
    if (m[2]) throw new YamlError(`line ${i + 1}: tab used for indentation`);
    toks.push({ indent: m[1].length, text: raw.slice(m[1].length), raw, n: i + 1 });
  });
  let pos = 0;
  const peek = () => { while (pos < toks.length && toks[pos].blank) pos++; return toks[pos]; };

  function scalar(s, n) {
    s = s.trim();
    if (s === "") return null;
    if (s.startsWith('"')) {
      let out = "", i = 1;
      for (; i < s.length; i++) {
        const c = s[i];
        if (c === "\\") {
          const e = s[++i];
          const map = { n: "\n", t: "\t", '"': '"', "\\": "\\", "/": "/", r: "\r", "0": "\0", " ": " " };
          if (e in map) out += map[e];
          else if (e === "u") { out += String.fromCharCode(parseInt(s.slice(i + 1, i + 5), 16)); i += 4; }
          else throw new YamlError(`line ${n}: unknown escape \\${e}`);
        } else if (c === '"') break;
        else out += c;
      }
      if (i >= s.length) throw new YamlError(`line ${n}: unterminated double-quoted string`);
      const rest = s.slice(i + 1).trim();
      if (rest && !rest.startsWith("#")) throw new YamlError(`line ${n}: text after a closing quote`);
      return out;
    }
    if (s.startsWith("'")) {
      let out = "", i = 1;
      for (; i < s.length; i++) {
        if (s[i] === "'") { if (s[i + 1] === "'") { out += "'"; i++; } else break; } else out += s[i];
      }
      if (i >= s.length) throw new YamlError(`line ${n}: unterminated single-quoted string`);
      const rest = s.slice(i + 1).trim();
      if (rest && !rest.startsWith("#")) throw new YamlError(`line ${n}: text after a closing quote`);
      return out;
    }
    if (s.startsWith("[")) {
      if (!s.endsWith("]")) throw new YamlError(`line ${n}: flow sequence must close on the same line`);
      const inner = s.slice(1, -1).trim();
      if (!inner) return [];
      const items = []; let cur = "", q = null;
      for (const c of inner) {
        if (q) { cur += c; if (c === q) q = null; continue; }
        if (c === '"' || c === "'") { q = c; cur += c; continue; }
        if (c === ",") { items.push(cur); cur = ""; continue; }
        if (c === "[" || c === "{") throw new YamlError(`line ${n}: nested flow collections are not supported`);
        cur += c;
      }
      if (q) throw new YamlError(`line ${n}: unterminated quote in a flow sequence`);
      items.push(cur);
      return items.map((x) => scalar(x, n));
    }
    if (/^[{&*!|>%@`]/.test(s)) throw new YamlError(`line ${n}: plain value starts with "${s[0]}"; quote it`);
    if (/^[-?:](\s|$)/.test(s)) throw new YamlError(`line ${n}: plain value starts with an indicator; quote it`);
    if (/:(\s|$)/.test(s)) throw new YamlError(`line ${n}: ": " inside an unquoted value; quote it or use a folded block (>)`);
    if (/\s#/.test(s)) throw new YamlError(`line ${n}: " #" inside an unquoted value starts a comment; quote the value`);
    if (/^(true|false)$/i.test(s)) return /^true$/i.test(s);
    if (/^(null|~)$/i.test(s)) return null;
    if (/^[-+]?(\d+|\d*\.\d+)([eE][-+]?\d+)?$/.test(s)) return Number(s);
    return s;
  }

  function blockScalar(header, parentIndent, n) {
    const m = /^([|>])([-+]?)(\d?)([-+]?)\s*(#.*)?$/.exec(header);
    if (!m) throw new YamlError(`line ${n}: bad block scalar header "${header}"`);
    const folded = m[1] === ">", chomp = m[2] || m[4];
    const body = [];
    let indent = m[3] ? parentIndent + Number(m[3]) : null;
    while (pos < toks.length) {
      const t = toks[pos];
      if (t.blank) { body.push(""); pos++; continue; }
      if (t.indent <= parentIndent) break;
      if (indent === null) indent = t.indent;
      if (t.indent < indent) throw new YamlError(`line ${t.n}: block scalar line is less indented than its first line`);
      body.push(t.raw.slice(indent)); pos++;
    }
    let trail = 0;
    while (body.length && body[body.length - 1] === "") { body.pop(); trail++; }
    let out;
    if (!folded) out = body.join("\n");
    else {
      out = "";
      body.forEach((l, i) => {
        if (i === 0) { out = l; return; }
        const prev = body[i - 1];
        if (l === "") out += "\n";
        else if (prev === "" || /^\s/.test(l) || /^\s/.test(prev)) out += (prev === "" ? "" : "\n") + l;
        else out += " " + l;
      });
    }
    if (chomp === "-") return out;
    if (chomp === "+") return out + "\n" + "\n".repeat(trail);
    return body.length ? out + "\n" : "";
  }

  function block(indent) {
    const t = peek();
    if (!t) return null;
    if (t.text.startsWith("- ") || t.text === "-") return sequence(t.indent);
    return mapping(t.indent);
  }

  function value(rest, ownIndent, n) {
    rest = rest.trim();
    if (rest === "" || rest.startsWith("#")) {
      const next = peek();
      if (next && next.indent > ownIndent) return block(next.indent);
      if (next && next.indent === ownIndent && next.text.startsWith("- ")) return sequence(ownIndent);
      return null;
    }
    if (/^[|>]/.test(rest)) return blockScalar(rest, ownIndent, n);
    return scalar(rest, n);
  }

  function mapping(indent) {
    const obj = {};
    for (;;) {
      const t = peek();
      if (!t || t.indent < indent) break;
      if (t.indent > indent) throw new YamlError(`line ${t.n}: unexpected indentation`);
      if (t.text.startsWith("- ")) break;
      if (/^(---|\.\.\.)\s*$/.test(t.text)) throw new YamlError(`line ${t.n}: document marker inside the YAML`);
      const m = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s"'#][^:#]*?)\s*:(?:\s+|$)(.*)$/.exec(t.text);
      if (!m) throw new YamlError(`line ${t.n}: expected "key: value", got "${t.text}"`);
      const key = String(scalar(m[1], t.n));
      if (Object.prototype.hasOwnProperty.call(obj, key)) throw new YamlError(`line ${t.n}: duplicate key "${key}"`);
      pos++;
      obj[key] = value(m[2], indent, t.n);
    }
    return obj;
  }

  function sequence(indent) {
    const arr = [];
    for (;;) {
      const t = peek();
      if (!t || t.indent < indent || !(t.text.startsWith("- ") || t.text === "-")) break;
      if (t.indent > indent) throw new YamlError(`line ${t.n}: unexpected indentation`);
      const rest = t.text === "-" ? "" : t.text.slice(2);
      const itemIndent = indent + 2;
      if (/^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s"'#\[][^:#]*?)\s*:(\s|$)/.test(rest)) {
        // "- key: value" starts a mapping whose keys sit at indent + 2
        toks[pos] = { indent: itemIndent, text: rest, raw: " ".repeat(itemIndent) + rest, n: t.n };
        arr.push(mapping(itemIndent));
      } else {
        pos++;
        arr.push(value(rest, indent, t.n));
      }
    }
    return arr;
  }

  const first = peek();
  if (!first) return {};
  if (first.indent !== 0) throw new YamlError(`line ${first.n}: the document must start at column 0`);
  const doc = block(0);
  const left = peek();
  if (left) throw new YamlError(`line ${left.n}: could not parse "${left.text}"`);
  return doc;
}

// SKILL.md: frontmatter must open on line 1 with --- and close with ---.
export function frontmatter(text) {
  const lines = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");
  if (lines[0] !== "---") throw new YamlError("line 1 must be exactly ---");
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new YamlError("frontmatter has no closing ---");
  return { data: parseYaml(lines.slice(1, end).join("\n")), bodyLines: lines.length - end - 1 };
}

// ---------------------------------------------------------------- Markdown links
// Relative link targets in a Markdown file, ignoring fenced code, inline code, URLs with a scheme and pure anchors.
export function markdownLinks(text) {
  const out = [];
  let inFence = false, fence = "";
  text.replace(/\r\n?/g, "\n").split("\n").forEach((line, i) => {
    const f = /^\s*(```+|~~~+)/.exec(line);
    if (f) { if (!inFence) { inFence = true; fence = f[1][0]; } else if (f[1][0] === fence) inFence = false; return; }
    if (inFence) return;
    const clean = line.replace(/`[^`]*`/g, "");
    const found = [];
    for (const m of clean.matchAll(/!?\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) found.push(m[1]);
    for (const m of clean.matchAll(/^\s*\[[^\]]+\]:\s*<?(\S+?)>?(\s|$)/g)) found.push(m[1]);
    for (const m of clean.matchAll(/<(?:a|img|source)\b[^>]*?\b(?:href|src|srcset)\s*=\s*"([^"]+)"/gi)) found.push(m[1].split(/\s+/)[0]);
    for (const target of found) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#") || target.startsWith("//")) continue;
      out.push({ target, line: i + 1 });
    }
  });
  return out;
}

// ---------------------------------------------------------------- Python
let cachedPython;
export function findPython() {
  if (cachedPython !== undefined) return cachedPython;
  const candidates = process.env.PYTHON ? [[process.env.PYTHON]] : [["python3"], ["python"], ["py", "-3"]];
  cachedPython = null;
  for (const c of candidates) {
    const r = spawnSync(c[0], [...c.slice(1), "-c", "import sys; print(sys.version_info[:2] >= (3, 10))"], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim() === "True") { cachedPython = c; break; }
  }
  return cachedPython;
}

export function hasCommand(cmd, args = ["-version"]) {
  const r = spawnSync(cmd, args, { stdio: "ignore" });
  return !r.error && r.status === 0;
}
