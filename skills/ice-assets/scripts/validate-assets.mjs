// Asset provenance gate for Ice Motion Director projects. Original code written for this repository
// (Apache-2.0) from the rules in ../references/brand-authenticity.md section 9,
// ../references/sourcing-and-licenses.md and ../references/ai-media-policy.md. Rights are the user's (sourcing-and-licenses.md
// section 0): a license problem is never a FAIL; it is printed as a LICENSE line for the delivery note's
// "Needs a license before publishing" list.
//
//   node validate-assets.mjs [--project <dir>] [--manifest <file>] [--state <file>] [--credits <file>]
//                            [--scan <dir>]... [--json]
//
// Defaults (relative to --project, which defaults to the current folder):
//   manifest  ice/assets/manifest.json     state  ice/state.json     credits  ice/assets/CREDITS.md
//   scan      assets/ and ice/assets/ (every media file there must have a manifest row)
//
// Checks, one plain-English line per problem:
//   1. every listed file exists, is a local path inside the project, and is not listed twice;
//   2. every row names its source: user-provided, licensed (license id plus license URL),
//      found on the web (source URL, owner and license status), code-built (the script that made it) or generated
//      by AI (tool plus prompt record);
//   3. license fit, as LICENSE lines (never a FAIL): unknown or to-buy items, noncommercial licenses when
//      commercial_use in ice/state.json is not 'no', share-alike without the user's recorded agreement, and
//      no-derivatives items that were changed;
//   4. a license that requires attribution has attribution text and a line in CREDITS.md;
//   5. official logo and wordmark files carry a sha256 that still matches (the file is untouched);
//   6. no media file in the scanned folders is missing from the manifest (license texts, the working data
//      files in ice/assets, such as a claims list or the per-page brand sheets in ice/assets/captures/, and a
//      capture-brand.mjs brand sheet left next to its captures in assets/ need no row);
//   7. AI-generated rows never hold text, numbers, logos or any identity-bearing role;
//   8. a wordmark set as live text (authenticity 'text-set', for a brand the user confirmed has no logo) names the
//      exact text, its font and where the confirmation is recorded; it is printed as a NOTE so nobody mistakes it
//      for an official file;
//   9. a code-built UI rebuild of a real screen names the capture it copies (verified_against, a local file, or a
//      list of them when one code file rebuilds several screens) and a side-by-side fidelity score of at least 0.9
//      per capture (fidelity: one object, or a list of { against, score, checked_by, sheet, share_sheet }); rows
//      that rebuild different captures in the same code file may share its path; a fidelity sheet with no masked
//      share copy (share_sheet) is a WARN.
// Exit 0 on PASS, 1 on FAIL, 2 when the manifest cannot be read. Node 18 or newer, no dependencies.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const IDENTITY_ROLES = new Set(["logo", "wordmark", "product", "ui", "mascot", "person", "packaging", "partner-logo"]);
const UNTOUCHED_ROLES = new Set(["logo", "wordmark", "partner-logo"]);
const ROLES = new Set([...IDENTITY_ROLES, "font", "photo", "footage", "music", "sfx", "texture", "icon", "model3d", "generated"]);
const OFFICIAL_TYPES = new Set(["user-provided", "official-site", "official-kit", "official-repo"]);
const LICENSED_TYPES = new Set(["official-site", "official-kit", "official-repo", "company-library", "licensed-stock", "public-domain", "font-library"]);
// Footage, photos or music found on the web (an agency, a broadcaster, an official account, a reference's own media),
// licensed or not: rights are the user's, recorded with rights.license_status.
const FOUND_TYPE = "web-found";
const LICENSE_STATUS = new Set(["licensed", "unknown", "needs purchase"]);
const SOURCE_TYPES = new Set([...OFFICIAL_TYPES, ...LICENSED_TYPES, FOUND_TYPE, "generated", "code-built"]);
const AI_FORBIDDEN_CONTENT = new Set(["text", "numbers", "logo", "wordmark", "ui", "person", "product"]);
const MIN_FIDELITY = 0.9;
// License texts ship beside fonts and other items under many names (OFL.txt, Cairo-OFL.txt, LICENSE.md, font.license).
const LICENSE_TEXT = /(^|[._-])(license|licence|copying|notice|ofl|readme)([._-][^/\\]*)?$/i;
const TEXT_EXT = /\.(txt|md|license)$|^[^.]+$/i;
// Working records in ice/assets (truth sheet, claims list, notes, tables) are not media and need no manifest row.
const DATA_EXT = /\.(json|md|txt|csv|tsv|ya?ml)$/i;

// ---------- small helpers ----------

const text = (v) => (typeof v === "string" ? v.trim() : "");
const isHttps = (v) => /^https:\/\/\S+$/i.test(text(v));
const slash = (p) => p.split(sep).join("/");
const key = (p) => slash(p).toLowerCase(); // project names are lowercase; compare without case on every OS

function readJson(file) {
  try { return { value: JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, "")) }; }
  catch (e) { return { error: existsSync(file) ? `${file} is not valid JSON (${e.message})` : `${file} does not exist` }; }
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// ---------- license classes (sourcing-and-licenses.md section 2) ----------

/** Returns { cls, attribution } for a license id such as CC0-1.0, CC-BY-4.0, OFL-1.1 or Pexels. */
export function classifyLicense(id) {
  const s = text(id).toLowerCase().replace(/[\s_]+/g, "-");
  if (!s || /unknown|unconfirmed|unclear|no-known-restrictions/.test(s)) return { cls: "unknown", attribution: false };
  if (/^(cc0|pdm|public-domain)/.test(s)) return { cls: "public-domain", attribution: false };
  if (/^cc-by/.test(s)) {
    if (/-nc/.test(s)) return { cls: "noncommercial", attribution: true };
    if (/-nd/.test(s)) return { cls: "no-derivatives", attribution: true };
    if (/-sa/.test(s)) return { cls: "share-alike", attribution: true };
    return { cls: "attribution", attribution: true };
  }
  if (/^odbl/.test(s)) return { cls: "share-alike", attribution: true };
  if (/^(ofl|mit|apache|isc|bsd|ufl|zlib|unlicense)/.test(s)) return { cls: "permissive", attribution: false };
  if (/^(pixabay|pexels|unsplash|mixkit|coverr|kenney)/.test(s)) return { cls: "platform", attribution: false };
  if (/^(proprietary|custom|owned|purchased|commercial)/.test(s)) return { cls: "custom", attribution: false };
  return { cls: "unrecognized", attribution: false };
}

// ---------- per-row checks ----------

const isTextSet = (row) => text(row.authenticity) === "text-set";

function checkPath(row, ctx, say) {
  const p = text(row.path);
  if (!p && isTextSet(row)) return null; // live text has no file; it is rendered by the composition
  if (!p) return say("has no path"), null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p)) return say(`path '${p}' is a URL; every asset must be a local file in the project before render`), null;
  const full = isAbsolute(p) ? resolve(p) : resolve(ctx.project, p);
  const rel = relative(ctx.project, full);
  if (!rel || rel.startsWith("..") || isAbsolute(rel)) return say(`path '${p}' is outside the project folder`), null;
  if (!existsSync(full) || !statSync(full).isFile()) return say(`file '${p}' does not exist`), null;
  return full;
}

function checkSource(row, say) {
  const src = row.source ?? {};
  const type = text(src.type);
  if (!type) return say("has no source.type (user-provided, licensed, web-found, code-built or generated)"), type;
  if (!SOURCE_TYPES.has(type)) return say(`source.type '${type}' is not an allowed type (${[...SOURCE_TYPES].join(", ")})`), type;
  const rights = row.rights ?? {};
  if (type === "user-provided") {
    if (!/^user-provided:\/\/\S+/.test(text(src.url))) say("is user-provided but source.url is not 'user-provided://<original file name>'");
    if (!text(rights.owner)) say("is user-provided but rights.owner does not say who holds the rights");
  } else if (LICENSED_TYPES.has(type)) {
    if (!isHttps(src.url)) say(`is ${type} but source.url is not an https link to where it came from`);
    if (!text(rights.license)) say(`is ${type} but rights.license has no license id`);
    if (!isHttps(rights.license_url)) say(`is ${type} but rights.license_url is not an https link to the license text`);
  } else if (type === FOUND_TYPE) {
    if (!isHttps(src.url)) say("is web-found but source.url is not an https link to where it came from");
    if (!text(rights.owner)) say("is web-found but rights.owner does not say who made or holds it");
    if (!text(rights.license) && !LICENSE_STATUS.has(text(rights.license_status))) {
      say(`is web-found but has neither rights.license nor rights.license_status (${[...LICENSE_STATUS].join(", ")})`);
    }
  } else if (type === "code-built") {
    if (!text(src.script)) say("is code-built but source.script does not name the code that made it");
  } else if (type === "generated") {
    if (!text(src.tool)) say("is AI-generated but source.tool does not name the tool and model");
    if (!text(src.prompt) && !text(src.generated_id)) say("is AI-generated but has no prompt record (source.prompt or source.generated_id)");
  }
  return type;
}

function checkLicense(row, type, ctx, say, needs) {
  const rights = row.rights ?? {};
  const status = text(rights.license_status);
  if (status && status !== "licensed") needs(`status '${status}'`);
  if (!text(rights.license)) return;
  const { cls, attribution } = classifyLicense(rights.license);
  const lic = text(rights.license);
  if (cls === "unknown") needs(`license '${lic}' is unconfirmed`);
  if (cls === "unrecognized") say(`license '${lic}' is not a known license id; use an SPDX id (for example a CC, OFL, MIT or Apache id) or a platform name, so the gate can judge it`);
  if (cls === "noncommercial" && ctx.commercial !== "no") {
    needs(`license '${lic}' is noncommercial and ice/state.json commercial_use is '${ctx.commercial}'`);
  }
  if (cls === "share-alike" && rights.share_alike_agreed !== true) {
    needs(`license '${lic}' is share-alike and the user has not accepted its terms (rights.share_alike_agreed)`);
  }
  if (cls === "no-derivatives" && text(row.changes) && !/^none$/i.test(text(row.changes))) {
    needs(`license '${lic}' forbids changes and the row records changes '${text(row.changes)}'`);
  }
  if (cls === "custom" && !text(rights.use)) say(`license '${lic}' is a custom license; rights.use must state the allowed use`);
  if (attribution || rights.attribution_required === true) {
    const credit = text(rights.attribution);
    if (!credit || /^none$/i.test(credit)) say(`license '${lic}' requires attribution but rights.attribution is empty`);
    const file = basename(text(row.path)).toLowerCase();
    if (!ctx.credits) say(`license '${lic}' requires attribution but ice/assets/CREDITS.md does not exist`);
    else if (file && !ctx.credits.includes(file)) say(`license '${lic}' requires attribution but CREDITS.md has no line naming '${basename(text(row.path))}'`);
  }
}

/** A wordmark set as live text: allowed only for a brand with no logo, confirmed by the user (brand-authenticity.md section 4). */
function checkTextSet(row, type, ctx, say, note) {
  const role = text(row.role);
  if (role !== "wordmark") return say(`authenticity 'text-set' is only for the role 'wordmark' (a brand with no logo yet), not '${role}'`);
  if (type !== "code-built") say("is a text-set wordmark but source.type is not 'code-built'");
  if (!text(row.text)) say("is a text-set wordmark but 'text' does not hold the exact name as set on screen (copied from TRUTH.md)");
  if (!text(row.no_logo_confirmed)) say("is a text-set wordmark but 'no_logo_confirmed' does not say where the user's 'no logo exists' answer is recorded (a BRIEF answer or a D-NN entry)");
  const font = text(row.font);
  if (!font) say("is a text-set wordmark but 'font' does not name the font row or file it is set in");
  else if (ctx.rowsById.has(font) && text(ctx.rowsById.get(font).role) !== "font") say(`is a text-set wordmark but its font '${font}' is a row whose role is not 'font'`);
  if (text(row.sha256)) say("is a text-set wordmark but carries a sha256; only official files carry one");
  note(`wordmark '${text(row.id)}' is set as live text "${text(row.text)}" in ${font || "an unnamed font"}: no logo exists (confirmed: ${text(row.no_logo_confirmed) || "missing"}); it is not an official file`);
}

const isRebuild = (row) => text(row?.source?.type) === "code-built" && ["ui", "product"].includes(text(row?.role)) && !isTextSet(row);
const isUrl = (v) => /^[a-z][a-z0-9+.-]*:\/\//i.test(v);

/** The captures a rebuild copies: verified_against as one path or a list of paths. */
function capturesOf(row) {
  const v = row.verified_against;
  return (Array.isArray(v) ? v : [v]).map(text);
}

/**
 * A code-built rebuild of a real screen must copy one or more captures and pass the side-by-side check for each
 * (brand-authenticity.md section 11.1). Old form: verified_against "<file>" with fidelity { score, checked_by, sheet }.
 * One code file that rebuilds several screens: verified_against ["<file>", ...] with fidelity
 * [{ against: "<file>", score, checked_by, sheet, share_sheet }, ...], one entry per capture.
 */
function checkRebuild(row, ctx, say, warn) {
  const what = `is a code-built ${text(row.role)} rebuild`;
  const list = capturesOf(row);
  if (!list.length || list.every((a) => !a)) return say(`${what} but verified_against does not name the capture it copies`);
  if (list.some((a) => !a)) say(`${what} but verified_against has an empty entry`);
  const captures = list.filter(Boolean);
  for (const against of captures) {
    if (isUrl(against)) say(`${what} but verified_against '${against}' is a URL; name the local capture file (assets/capture/...)`);
    else if (!existsSync(resolve(ctx.project, against))) say(`${what} but its capture '${against}' does not exist in the project`);
  }
  const raw = row.fidelity;
  const entries = Array.isArray(raw) ? raw.filter((e) => e && typeof e === "object") : raw && typeof raw === "object" ? [raw] : [];
  const scoreOk = (entry, label) => {
    const score = Number(entry?.score);
    if (!Number.isFinite(score)) say(`${what} but has no fidelity.score from the side-by-side check${label}`);
    else if (score < MIN_FIDELITY) say(`${what} with fidelity ${score}${label}; at least ${MIN_FIDELITY} is required (fix the rebuild against the capture)`);
  };
  if (captures.length <= 1 && !Array.isArray(raw)) scoreOk(entries[0], "");
  else {
    if (!Array.isArray(raw)) say(`${what} with ${captures.length} captures in verified_against but fidelity is a single object; give a list with one { against, score, checked_by, sheet } per capture`);
    for (const against of captures) {
      const entry = entries.find((e) => key(text(e.against)) === key(against)) ?? (captures.length === 1 && entries.length === 1 && !text(entries[0].against) ? entries[0] : null);
      if (!entry) { if (Array.isArray(raw)) say(`${what} but fidelity has no entry whose 'against' is the capture '${against}'`); continue; }
      scoreOk(entry, ` for '${against}'`);
    }
    for (const e of entries) if (text(e.against) && !captures.some((a) => key(a) === key(text(e.against)))) say(`${what} but fidelity names '${text(e.against)}', which is not in verified_against`);
  }
  for (const e of entries) {
    const share = text(e.share_sheet);
    if (share) {
      if (isUrl(share) || !existsSync(resolve(ctx.project, share))) say(`${what} but its fidelity share_sheet '${share}' is not a file in the project`);
    } else if (text(e.sheet)) {
      warn(`asset '${text(row.id)}': the fidelity sheet '${text(e.sheet)}' has no share_sheet; before any sheet leaves this machine or goes into the case study, make the copy with other rights holders' content masked (brand-authenticity.md section 11.1) and record it as share_sheet`);
    }
  }
}

/** A brand sheet written by capture-brand.mjs (a working record wherever it was written, so it needs no row). */
function isBrandSheet(file) {
  if (!/\.json$/i.test(file)) return false;
  try {
    if (statSync(file).size > 20 * 1024 * 1024) return false;
    return JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""))?.tool === "capture-brand.mjs";
  } catch { return false; }
}

function checkIdentity(row, type, full, ctx, say, note, warn) {
  const role = text(row.role);
  if (isTextSet(row)) return checkTextSet(row, type, ctx, say, note);
  if (type === "code-built" && (role === "ui" || role === "product")) checkRebuild(row, ctx, say, warn);
  const contains = Array.isArray(row.contains) ? row.contains.map((c) => text(c).toLowerCase()) : null;
  if (type === "generated" || text(row.authenticity) === "generated") {
    if (IDENTITY_ROLES.has(role)) say(`is AI-generated but has the identity-bearing role '${role}'; logos, products, UI, mascots and people are never generated`);
    if (!contains) say("is AI-generated but has no 'contains' list declaring what it shows (use [] for a pure background)");
    else for (const c of contains) if (AI_FORBIDDEN_CONTENT.has(c)) say(`is AI-generated but contains '${c}'; text, numbers and logos are rendered by code or come from official files`);
    return;
  }
  if (IDENTITY_ROLES.has(role) && text(row.authenticity) !== "verified") say(`has the identity-bearing role '${role}' but authenticity is not 'verified'`);
  if (UNTOUCHED_ROLES.has(role) && !OFFICIAL_TYPES.has(type)) say(`is a ${role} but source.type '${type}' is not user-provided or an official site, kit or repo`);
  if (UNTOUCHED_ROLES.has(role) && OFFICIAL_TYPES.has(type) && !text(row.sha256)) {
    say(`is an official ${role} but has no sha256; record the hash of the file as received so edits are caught`);
  }
  if (full && text(row.sha256)) {
    const actual = sha256(full);
    if (actual !== text(row.sha256).toLowerCase()) {
      say(UNTOUCHED_ROLES.has(role)
        ? `official ${role} file was changed after it was recorded (sha256 does not match); restore the original file`
        : "sha256 does not match the file on disk");
    }
  }
}

// ---------- the gate ----------

export function validate({ project, manifestPath, statePath, creditsPath, scanDirs }) {
  const problems = [], warnings = [], notes = [], licenses = [];
  const m = readJson(manifestPath);
  if (m.error) return { status: "ERROR", problems: [m.error], warnings, notes, licenses, checked: 0 };
  const rows = Array.isArray(m.value?.assets) ? m.value.assets : null;
  if (!rows) return { status: "ERROR", problems: ["manifest has no 'assets' array"], warnings, notes, licenses, checked: 0 };

  const st = readJson(statePath);
  let commercial = text(st.value?.commercial_use).toLowerCase();
  if (st.error) warnings.push(`${st.error}; commercial_use treated as 'unknown'`);
  if (!["yes", "no", "unknown"].includes(commercial)) commercial = "unknown";
  const credits = existsSync(creditsPath) ? readFileSync(creditsPath, "utf8").toLowerCase() : null;
  const rowsById = new Map(rows.filter((r) => text(r?.id)).map((r) => [text(r.id), r]));
  const ctx = { project, commercial, credits, rowsById };

  const listed = new Map(), ids = new Set();
  rows.forEach((row, i) => {
    const name = text(row?.id) || `row ${i + 1}`;
    const say = (msg) => problems.push(`asset '${name}' ${msg}`);
    if (!text(row?.id)) say("has no id");
    else if (ids.has(row.id)) say("uses an id that another row already uses");
    ids.add(row?.id);
    if (!ROLES.has(text(row?.role))) say(`role '${text(row?.role)}' is not one of ${[...ROLES].join(", ")}`);
    const full = checkPath(row ?? {}, ctx, say);
    if (full) {
      // One code file may rebuild several captured screens: rows that are all code-built ui or product rebuilds of
      // different captures may share it. Any other repeat of a path is a duplicate.
      const k = key(relative(project, full));
      const prev = listed.get(k);
      if (prev) {
        const both = isRebuild(row) && prev.rows.every(isRebuild);
        const mine = capturesOf(row ?? {}).filter(Boolean).map(key);
        const clash = prev.rows.some((p) => capturesOf(p).filter(Boolean).map(key).some((c) => mine.includes(c)));
        if (!both) say(`lists the same file as asset '${prev.name}' (only code-built ui or product rebuilds of different captures may share a file)`);
        else if (clash) say(`rebuilds the same capture as asset '${prev.name}' in the same file; merge the two rows`);
        prev.rows.push(row);
      } else listed.set(k, { name, rows: [row] });
    }
    const type = checkSource(row ?? {}, say);
    const where = text(row?.source?.url);
    checkLicense(row ?? {}, type, ctx, say, (msg) => licenses.push(`asset '${name}' ${msg}; needs a license before publishing${where ? ` (${where})` : ""}`));
    checkIdentity(row ?? {}, type, full, ctx, say, (msg) => notes.push(msg), (msg) => warnings.push(msg));
  });

  for (const dir of scanDirs) {
    for (const file of walk(dir)) {
      const name = basename(file);
      if (LICENSE_TEXT.test(name) && TEXT_EXT.test(name)) continue;
      const rel = relative(project, file);
      if (key(rel).startsWith("ice/assets/") && DATA_EXT.test(name)) continue;
      if (isBrandSheet(file)) continue; // older layout: the sheet next to its captures in assets/capture/<brand>/
      if (!listed.has(key(rel))) problems.push(`file '${slash(rel)}' is in the project but has no row in the manifest`);
    }
  }
  if (!rows.length) warnings.push("manifest lists no assets");
  return { status: problems.length ? "FAIL" : "PASS", problems, warnings, notes, licenses, checked: rows.length, commercial };
}

// ---------- CLI ----------

function parseArgs(argv) {
  const opts = { scan: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (["--project", "--manifest", "--state", "--credits", "--scan"].includes(a) && argv[i + 1]) {
      const v = argv[++i];
      if (a === "--scan") opts.scan.push(v); else opts[a.slice(2)] = v;
    } else opts.bad = a;
  }
  return opts;
}

const samePath = (a, b) => (process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b);
const isMain = Boolean(process.argv[1]) && samePath(resolve(process.argv[1]), fileURLToPath(import.meta.url));
if (isMain) {
  const o = parseArgs(process.argv.slice(2));
  if (o.help || o.bad) {
    console.log("usage: node validate-assets.mjs [--project <dir>] [--manifest <file>] [--state <file>] [--credits <file>] [--scan <dir>]... [--json]");
    process.exit(o.bad ? 2 : 0);
  }
  const project = resolve(o.project ?? ".");
  const at = (v, ...d) => (v ? resolve(project, v) : join(project, ...d));
  const result = validate({
    project,
    manifestPath: at(o.manifest, "ice", "assets", "manifest.json"),
    statePath: at(o.state, "ice", "state.json"),
    creditsPath: at(o.credits, "ice", "assets", "CREDITS.md"),
    scanDirs: o.scan.length ? o.scan.map((d) => resolve(project, d)) : [join(project, "assets"), join(project, "ice", "assets")],
  });
  if (o.json) console.log(JSON.stringify(result, null, 2));
  else {
    for (const w of result.warnings) console.log(`  WARN  ${w}`);
    for (const n of result.notes ?? []) console.log(`  NOTE  ${n}`);
    for (const l of result.licenses ?? []) console.log(`  LICENSE  ${l}`);
    for (const p of result.problems) console.log(`  FAIL  ${p}`);
    console.log(result.status === "PASS"
      ? `ASSETS: PASS   ${result.checked} asset(s) checked (commercial_use: ${result.commercial})`
      : result.status === "ERROR" ? "ASSETS: ERROR   the manifest could not be read"
      : `ASSETS: FAIL   ${result.problems.length} problem(s) in ${result.checked} asset(s)`);
  }
  process.exit(result.status === "PASS" ? 0 : result.status === "ERROR" ? 2 : 1);
}
