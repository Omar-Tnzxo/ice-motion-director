// Adapted from alexgreensh/anidoodle (Apache-2.0), engine/tools/facts.mjs and engine/tools/factsrules.mjs.
// Changes: merged into one standalone file; engine imports removed; CLI takes --facts and --claims;
// Arabic-Indic and Persian digits are compared as Western digits; optional "id" field allowed;
// script path found with fileURLToPath so the CLI runs from paths with spaces or non-ASCII names on every OS.
//
// FACTS. Every claim a film makes, on screen or narrated, is listed in facts.json with the exact
// sentence it comes from and where that sentence lives (a URL or a file). Nothing is invented: no
// testimonial, rating, price, result or real person. What the film generates (a slogan, a drawn
// scene, a mock UI) is labelled `generated`.
//
//   node facts.mjs --facts ice/assets/facts.json --claims claims.json   check (claims.json: JSON array of strings)
//   node facts.mjs --facts ice/assets/facts.json                        check every listed entry's shape only
//   node facts.mjs init [--facts ice/assets/facts.json]                 write an empty facts.json (never overwrites)
//
// The check is light on purpose: it cannot know a sentence is true, so it holds what it can.
//   - every declared claim has an entry (matched ignoring case, spacing and end punctuation);
//   - a sourced entry has the exact sentence and a URL (http/https) or a file;
//   - a generated entry says what it is, and states no number (a number needs a source);
//   - every number in a sourced claim appears in its source sentence;
//   - a TODO is not a claim yet.
// A film that declares no claims is N/A, never a pass. A missing facts file or claims file is a FAIL (run init
// first), never N/A. Exit code 1 on FAIL, 2 on a usage error. --help prints this text.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const westernDigits = (s) => String(s ?? "")
  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
  .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
  .replace(/٫/g, ".").replace(/٬/g, ",");
export const normClaim = (s) => westernDigits(s).toLowerCase().replace(/\s+/g, " ").replace(/^[\s"'“”]+|[\s.!?:;"'“”؟،]+$/g, "");
const numbers = (s) => (westernDigits(s).match(/\d[\d.,]*\d|\d/g) ?? []).map((n) => n.replace(/[.,]+$/, ""));
export const EMPTY_FACTS = { version: 1, about: "Every claim the film makes, on screen or narrated. Sourced: { id, claim, where, source: { sentence, url or file } }. Generated: { id, claim, where, generated: true, note }. Nothing invented.", claims: [] };

/** One entry's own problems (shape only). */
export const entryProblems = (e) => {
  const out = [], claim = String(e?.claim ?? "").trim();
  if (!claim) return ["has no claim text"];
  if (/^todo\b/i.test(claim)) out.push("is still a TODO");
  if (e.generated === true) {
    if (!String(e.note ?? "").trim()) out.push("is generated but has no note saying what it is");
    if (numbers(claim).length) out.push("is generated but states a number (a number needs a source)");
    return out;
  }
  const src = e.source ?? {}, sentence = String(src.sentence ?? "").trim();
  if (!sentence) out.push("has no source.sentence (the exact sentence it comes from)");
  if (!String(src.url ?? "").trim() && !String(src.file ?? "").trim()) out.push("has no source.url or source.file");
  else if (src.url && !/^https?:\/\/\S+$/i.test(String(src.url).trim())) out.push(`source.url '${src.url}' is not an http(s) link`);
  if (sentence) {
    const have = new Set(numbers(sentence).map((n) => n.replace(/,/g, "")));
    for (const n of numbers(claim)) if (!have.has(n.replace(/,/g, ""))) out.push(`states ${n}, which the source sentence does not`);
  }
  return out;
};

/** claims: strings the film declares (or undefined). facts: parsed facts.json or null. */
export const checkFacts = (claims, facts) => {
  const declared = [...new Set((Array.isArray(claims) ? claims : []).map((c) => String(c).trim()).filter(Boolean))];
  if (!declared.length) return { status: "N/A", checked: 0, problems: [], reason: "the film declares no claims, so nothing was checked" };
  if (!facts) return { status: "FAIL", checked: declared.length, problems: declared.map((c) => ({ claim: c, why: "has no facts.json to be listed in (node facts.mjs init)" })) };
  const entries = Array.isArray(facts.claims) ? facts.claims : [], problems = [];
  if (!Array.isArray(facts.claims)) problems.push({ claim: "(facts.json)", why: "has no claims array" });
  const by = new Map(); for (const e of entries) { const k = normClaim(e?.claim); if (k && !by.has(k)) by.set(k, e); }
  for (const c of declared) {
    if (/^todo\b/i.test(c)) { problems.push({ claim: c, why: "is still a TODO in the film" }); continue; }
    const e = by.get(normClaim(c));
    if (!e) { problems.push({ claim: c, why: "is in the film but not listed in facts.json" }); continue; }
    for (const why of entryProblems(e)) problems.push({ claim: c, why });
  }
  const declaredKeys = new Set(declared.map(normClaim));
  for (const e of entries) if (!declaredKeys.has(normClaim(e?.claim))) for (const why of entryProblems(e)) problems.push({ claim: String(e?.claim ?? "(no claim)"), why });
  return { status: problems.length ? "FAIL" : "PASS", checked: declared.length, problems };
};

const readJson = (file, what) => {
  if (!existsSync(file)) return { value: null };
  try { return { value: JSON.parse(readFileSync(file, "utf8")) }; } catch (e) { return { value: null, error: `${what} ${file} is not valid JSON: ${e.message}` }; }
};

const samePath = (a, b) => (process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b);
const isMain = Boolean(process.argv[1]) && samePath(resolve(process.argv[1]), resolve(fileURLToPath(import.meta.url)));
if (isMain) {
  const argv = process.argv.slice(2), arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const help = () => readFileSync(fileURLToPath(import.meta.url), "utf8").split(/\r?\n/).filter((l, i, a) => a.slice(0, i + 1).every((x) => x.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/, "")).join("\n");
  if (argv.includes("--help") || argv.includes("-h")) { console.log(help()); process.exit(0); }
  const known = new Set(["init", "--facts", "--claims"]);
  const stray = argv.find((a, i) => !known.has(a) && !["--facts", "--claims"].includes(argv[i - 1]));
  if (stray !== undefined || (argv.includes("init") && argv[0] !== "init")) { console.error(`facts: unknown argument '${stray ?? "init"}'\n\n${help()}`); process.exit(2); }
  for (const k of ["--facts", "--claims"]) if (argv.includes(k) && !arg(k)) { console.error(`facts: ${k} needs a file path`); process.exit(2); }
  const factsPath = resolve(arg("--facts") ?? "ice/assets/facts.json");
  if (argv[0] === "init") {
    if (existsSync(factsPath)) { console.log(`facts: ${factsPath} already exists; left as it is`); process.exit(0); }
    mkdirSync(dirname(factsPath), { recursive: true }); writeFileSync(factsPath, JSON.stringify(EMPTY_FACTS, null, 2) + "\n");
    console.log(`facts: wrote ${factsPath}`); process.exit(0);
  }
  if (!existsSync(factsPath)) { console.log(`FACTS: FAIL   ${factsPath} does not exist; run 'node facts.mjs init --facts <path>' first (a film with no claims then reports N/A)`); process.exit(1); }
  const f = readJson(factsPath, "facts file");
  if (f.error) { console.log(`FACTS: FAIL   ${f.error}`); process.exit(1); }
  let claims;
  if (arg("--claims")) {
    if (!existsSync(resolve(arg("--claims")))) { console.log(`FACTS: FAIL   claims file ${resolve(arg("--claims"))} does not exist`); process.exit(1); }
    const c = readJson(resolve(arg("--claims")), "claims file");
    if (c.error || !Array.isArray(c.value)) { console.log(`FACTS: FAIL   ${c.error ?? "claims file must be a JSON array of strings"}`); process.exit(1); }
    claims = c.value;
  } else claims = (f.value?.claims ?? []).map((e) => e?.claim).filter(Boolean);
  const r = checkFacts(claims, f.value);
  console.log(`FACTS   ${factsPath}`);
  for (const p of r.problems) console.log(`  FAIL  "${String(p.claim).slice(0, 60)}" ${p.why}`);
  console.log(r.status === "N/A" ? `FACTS: N/A   ${r.reason}` : r.status === "PASS" ? `FACTS: PASS   ${r.checked} claim(s), each listed with its source or labelled generated` : `FACTS: FAIL   ${r.problems.length} problem(s) in ${r.checked} claim(s)`);
  process.exit(r.status === "FAIL" ? 1 : 0);
}
