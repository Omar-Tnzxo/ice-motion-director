// Skill frontmatter, agents/openai.yaml, plugin manifests (version sync and Codex limits) and pinned versions.
// Run: node --test tests/
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { abs, frontmatter, parseYaml, readJson, readText, repoFiles, SKILLS, YamlError } from "./helpers.mjs";

const PORTABLE_KEYS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

test("YAML parser rejects the traps strict parsers trip on", () => {
  const bad = ['description: a: b', "description: x # y", "key: 1\nkey: 2", "a:\n\tb: 1", 'a: "open', "a: @x", "a: [1, [2]]"];
  for (const y of bad) assert.throws(() => parseYaml(y), YamlError, y);
  assert.deepEqual(parseYaml("a: >-\n  one\n  two\nb: |\n  x\n  y\nc: 'it''s'\nd: [\"p\", q]\ne:\n  - k: v\n    w: true\n"),
    { a: "one two", b: "x\ny\n", c: "it's", d: ["p", "q"], e: [{ k: "v", w: true }] });
});

for (const skill of SKILLS) {
  test(`skills/${skill}/SKILL.md frontmatter`, () => {
    let fm;
    try { fm = frontmatter(readText(`skills/${skill}/SKILL.md`)).data; } catch (e) { assert.fail(`strict YAML: ${e.message}`); }
    assert.equal(typeof fm, "object");
    for (const k of Object.keys(fm)) assert.ok(PORTABLE_KEYS.has(k), `non-portable frontmatter key "${k}" (claude.ai accepts only ${[...PORTABLE_KEYS].join(", ")})`);
    assert.equal(fm.name, skill, "name must equal the folder name");
    assert.match(fm.name, NAME_RE, "name: lowercase letters, digits and single hyphens");
    assert.ok(fm.name.length <= 64, "name longer than 64");
    assert.equal(typeof fm.description, "string", "description must be one string");
    const len = fm.description.trim().length;
    assert.ok(len >= 1 && len <= 1024, `description is ${len} characters (1 to 1024)`);
    if (fm.compatibility !== undefined) {
      assert.equal(typeof fm.compatibility, "string");
      assert.ok(fm.compatibility.length <= 500, "compatibility longer than 500");
    }
    if (fm.license !== undefined) assert.equal(typeof fm.license, "string");
    if (fm.metadata !== undefined && fm.metadata !== null) {
      assert.equal(typeof fm.metadata, "object", "metadata must be a map");
      for (const [k, v] of Object.entries(fm.metadata)) assert.equal(typeof v, "string", `metadata.${k} must be a string (quote it)`);
    }
  });

  test(`skills/${skill}/agents/openai.yaml`, () => {
    const f = `skills/${skill}/agents/openai.yaml`;
    assert.ok(existsSync(abs(f)), "missing agents/openai.yaml");
    let y;
    try { y = parseYaml(readText(f)); } catch (e) { assert.fail(`strict YAML: ${e.message}`); }
    assert.equal(typeof y?.interface, "object", "interface block missing");
    assert.equal(typeof y.interface.display_name, "string", "interface.display_name");
    assert.ok(y.interface.display_name.trim(), "interface.display_name is empty");
    assert.equal(typeof y.interface.short_description, "string", "interface.short_description");
    assert.ok(y.interface.short_description.trim(), "interface.short_description is empty");
    if (y.interface.default_prompt !== undefined) assert.equal(typeof y.interface.default_prompt, "string");
    if (skill === "ice-motion-director") assert.equal(typeof y.interface.default_prompt, "string", "the router needs default_prompt");
    if (y.policy?.allow_implicit_invocation !== undefined) assert.equal(typeof y.policy.allow_implicit_invocation, "boolean");
    for (const t of y.dependencies?.tools ?? []) {
      assert.equal(typeof t.type, "string", "dependencies.tools[].type");
      assert.equal(typeof t.value, "string", "dependencies.tools[].value");
    }
  });
}

// ---------------------------------------------------------------- stage commands
// architecture.md 2c: one thin skill per command, never implicit, slash-visible in OpenCode, a Gemini TOML each,
// and a body that sends the agent to the router's step-mode file (or the router itself for `ice`).
const STAGE_COMMANDS = ["ice", "ice-status", "ice-01-brief", "ice-02-concept", "ice-03-script", "ice-04-storyboard", "ice-05-look",
  "ice-06-animatic", "ice-07-build", "ice-08-sound", "ice-09-review", "ice-10-deliver"];

test("stage command skills: present, thin, explicit only, with a Gemini command each", () => {
  const problems = [];
  for (const name of STAGE_COMMANDS) {
    if (!SKILLS.includes(name)) { problems.push(`skills/${name} is missing`); continue; }
    const text = readText(`skills/${name}/SKILL.md`);
    const { data: fm, bodyLines } = frontmatter(text);
    if (Object.keys(fm).sort().join() !== "description,license,metadata,name") problems.push(`${name}: frontmatter keys must be name, description, license, metadata`);
    if (fm.metadata?.["opencode/slash"] !== "true") problems.push(`${name}: metadata opencode/slash must be "true"`);
    if (!fm.metadata?.author || !fm.metadata?.version) problems.push(`${name}: metadata needs author and version`);
    if (!/use it only when the user types/i.test(fm.description)) problems.push(`${name}: description must say to use it only when the user types the command`);
    if (bodyLines > 40) problems.push(`${name}: ${bodyLines} body lines; command skills stay thin`);
    if (!text.includes("$ARGUMENTS")) problems.push(`${name}: body must take the typed text ($ARGUMENTS)`);
    const target = name === "ice" ? "../ice-motion-director/SKILL.md" : "../ice-motion-director/references/step-mode.md";
    if (!text.includes(`(${target})`)) problems.push(`${name}: body must link ${target}`);
    const y = parseYaml(readText(`skills/${name}/agents/openai.yaml`));
    if (y.policy?.allow_implicit_invocation !== false) problems.push(`${name}: openai.yaml policy.allow_implicit_invocation must be false`);
    if ((y.interface?.short_description ?? "").length > 30) problems.push(`${name}: short_description over 30 characters`);
    const toml = `commands/${name}.toml`;
    if (!existsSync(abs(toml))) { problems.push(`${toml} is missing`); continue; }
    const t = readText(toml);
    if (!/^description = "[^"]+"$/m.test(t)) problems.push(`${toml}: needs a one-line description`);
    if (!/^prompt = """\n[\s\S]+\n"""\s*$/m.test(t.replace(/\r\n/g, "\n"))) problems.push(`${toml}: needs a multiline prompt`);
    if (!t.includes("{{args}}")) problems.push(`${toml}: prompt must include {{args}}`);
    if (!t.includes("ice-motion-director skill")) problems.push(`${toml}: prompt must name the ice-motion-director skill`);
  }
  assert.deepEqual(problems, []);
});

// Command descriptions stay short so they never crowd the router out of the skill listing (architecture.md 2c).
test("command skill descriptions are short and command-only", () => {
  const problems = [];
  for (const name of [...STAGE_COMMANDS, "ice-style"]) {
    const d = frontmatter(readText(`skills/${name}/SKILL.md`)).data.description.trim();
    if (d.length > 160) problems.push(`${name}: description is ${d.length} characters (160 at most)`);
    if (!/use it only when the user types/i.test(d)) problems.push(`${name}: description must be command-only`);
  }
  assert.deepEqual(problems, []);
});

// The router is the one entry point: front-loaded, under budget, with Arabic triggers and the engine-skill clause.
test("router description: entry point, Arabic triggers, short", () => {
  const d = frontmatter(readText("skills/ice-motion-director/SKILL.md")).data.description.trim();
  assert.ok(d.length <= 700, `router description is ${d.length} characters (700 at most)`);
  assert.match(d, /^Start here/, "the description starts with what it is for");
  assert.match(d, /HyperFrames/, "it must say it is the entry point even when engine skills are installed");
  for (const w of ["إعلان", "فيديو", "موشن جرافيك", "مونتاج", "ريلز"]) assert.ok(d.includes(w), `missing the Arabic trigger ${w}`);
});

test("evals/trigger-eval.json: both polarities, English and Arabic, no duplicates", () => {
  const items = readJson("evals/trigger-eval.json");
  assert.ok(Array.isArray(items) && items.length >= 16, "at least 16 prompts");
  const seen = new Set();
  for (const it of items) {
    assert.equal(typeof it.query, "string");
    assert.ok(it.query.trim(), "empty query");
    assert.equal(typeof it.should_trigger, "boolean");
    assert.ok(["en", "ar", "ar-EG"].includes(it.lang), `lang ${it.lang}`);
    assert.ok(!seen.has(it.query), `duplicate: ${it.query}`);
    seen.add(it.query);
  }
  for (const want of [true, false]) for (const lang of ["en", "ar", "ar-EG"]) {
    assert.ok(items.some((i) => i.should_trigger === want && i.lang === lang), `no ${want ? "should" : "should-not"}-trigger prompt in ${lang}`);
  }
});

// ---------------------------------------------------------------- manifests
const MANIFESTS = [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json", "plugin.json", "gemini-extension.json", ".agents/plugins/marketplace.json"];

test("every manifest parses and carries the same name and version", () => {
  const ref = readJson(".claude-plugin/plugin.json");
  assert.match(ref.version, /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/, "plugin version must be SemVer");
  const problems = [];
  for (const f of MANIFESTS) {
    if (!existsSync(abs(f))) { problems.push(`${f}: missing`); continue; }
    let j;
    try { j = readJson(f); } catch (e) { problems.push(`${f}: invalid JSON (${e.message})`); continue; }
    const entries = Array.isArray(j.plugins) ? j.plugins.filter((p) => p.name === ref.name) : [j];
    if (Array.isArray(j.plugins) && !entries.length) problems.push(`${f}: no plugins[] entry named ${ref.name}`);
    if (!Array.isArray(j.plugins) && j.name !== ref.name) problems.push(`${f}: name ${j.name} is not ${ref.name}`);
    for (const e of entries) {
      const v = e.version ?? e.source?.version;
      const required = !f.startsWith(".agents/");
      if (v === undefined && required) problems.push(`${f}: no version`);
      if (v !== undefined && v !== ref.version) problems.push(`${f}: version ${v} is not ${ref.version}`);
    }
  }
  assert.deepEqual(problems, []);
});

// AGENTS.md: a release bumps every manifest and every SKILL.md metadata.version together.
test("every SKILL.md metadata.version matches the plugin version", () => {
  const want = readJson(".claude-plugin/plugin.json").version;
  const problems = [];
  for (const skill of SKILLS) {
    const v = frontmatter(readText(`skills/${skill}/SKILL.md`)).data.metadata?.version;
    if (v !== want) problems.push(`skills/${skill}/SKILL.md: metadata.version ${v} is not ${want}`);
  }
  assert.deepEqual(problems, []);
});

function pngSize(file) {
  const b = readFileSync(file);
  if (b.length < 24 || b.toString("latin1", 1, 4) !== "PNG") return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test("Codex manifest field limits", () => {
  const j = readJson(".codex-plugin/plugin.json");
  const i = j.interface ?? {};
  const problems = [];
  const max = (label, v, n, required = true) => {
    if (v === undefined || v === null) { if (required) problems.push(`${label} missing`); return; }
    if (typeof v !== "string") problems.push(`${label} must be a string`);
    else if (v.length > n) problems.push(`${label} is ${v.length} characters (max ${n})`);
    else if (required && !v.trim()) problems.push(`${label} is empty`);
  };
  const https = (label, v, n, required = false) => {
    max(label, v, n, required);
    if (typeof v === "string" && !/^https:\/\//.test(v)) problems.push(`${label} must be an https URL`);
  };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(j.name ?? "") || j.name.length > 64) problems.push("name: lowercase, digits, single hyphens, max 64");
  if (!/^\d+\.\d+\.\d+/.test(j.version ?? "")) problems.push("version must be explicit SemVer");
  max("description", j.description, 4000);
  max("author.name", j.author?.name, 120);
  max("author.email", j.author?.email, 320, false);
  https("author.url", j.author?.url, 2048);
  https("homepage", j.homepage, 2048, true);
  if (j.skills !== "./skills/") problems.push('skills must be "./skills/"');
  max("interface.displayName", i.displayName, 30);
  max("interface.shortDescription", i.shortDescription, 30);
  max("interface.longDescription", i.longDescription, 4000);
  max("interface.developerName", i.developerName, 80);
  const categories = ["Developer Tools", "Productivity", "Creativity", "Communication", "Education & Research", "Data & Analytics",
    "Finance", "Business & Operations", "Security", "Scientific Research"];
  if (!categories.includes(i.category)) problems.push(`interface.category "${i.category}" is not a known category`);
  if (!Array.isArray(i.capabilities)) problems.push("interface.capabilities must be an array");
  else {
    if (i.capabilities.length > 20) problems.push("interface.capabilities has more than 20 items");
    for (const c of i.capabilities) if (typeof c !== "string" || c.length > 120) problems.push(`capability "${c}" invalid or over 120`);
  }
  for (const k of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) https(`interface.${k}`, i[k], 1024);
  const prompts = i.defaultPrompt ?? [];
  if (!Array.isArray(prompts) || prompts.length > 3) problems.push("interface.defaultPrompt: up to 3 entries");
  else {
    if (new Set(prompts).size !== prompts.length) problems.push("interface.defaultPrompt entries must be unique");
    for (const p of prompts) {
      if (typeof p !== "string" || !p.trim() || p.length > 128) problems.push(`defaultPrompt "${p}" empty or over 128`);
      if (/(^|\s)@\w/.test(p)) problems.push(`defaultPrompt "${p}" has an @mention`);
    }
  }
  for (const [k, against] of [["brandColor", "#FFFFFF"], ["brandColorDark", "#212121"]]) {
    if (i[k] === undefined) continue;
    if (!/^#[0-9A-Fa-f]{6}$/.test(i[k])) { problems.push(`interface.${k} must be #RRGGBB`); continue; }
    const r = contrast(i[k], against);
    if (r < 2) problems.push(`interface.${k} ${i[k]} has contrast ${r.toFixed(2)}:1 against ${against} (needs 2:1)`);
  }
  for (const k of ["composerIcon", "logo", "composerIconDark", "logoDark"]) {
    if (i[k] === undefined) { if (k === "composerIcon" || k === "logo") problems.push(`interface.${k} missing`); continue; }
    const p = abs(i[k].replace(/^\.\//, ""));
    if (!existsSync(p)) { problems.push(`interface.${k} ${i[k]} does not exist`); continue; }
    if (readFileSync(p).length > 5 * 1024 * 1024) problems.push(`interface.${k} is over 5 MiB`);
    if (/\.png$/i.test(p)) {
      const s = pngSize(p);
      if (!s) problems.push(`interface.${k} is not a valid PNG`);
      else if (s.w !== s.h || s.w < 48 || s.w > 4096) problems.push(`interface.${k} is ${s.w}x${s.h} (square, 48 to 4096 px)`);
    } else if (!/\.(svg|jpe?g|webp)$/i.test(p)) problems.push(`interface.${k} must be PNG, JPEG, WebP or SVG`);
  }
  const root = readJson("plugin.json");
  if (root.extensions?.["com.openai"]) {
    if (JSON.stringify(root) !== JSON.stringify(j)) problems.push("root plugin.json has extensions.com.openai, so it must equal .codex-plugin/plugin.json");
  }
  assert.deepEqual(problems, []);
});

test("Codex self-hosted marketplace", () => {
  const m = readJson(".agents/plugins/marketplace.json");
  const problems = [];
  if (typeof m.name !== "string") problems.push("name missing");
  if (typeof m.interface?.displayName !== "string") problems.push("interface.displayName missing");
  for (const p of m.plugins ?? []) {
    if (!["local", "url", "git-subdir", "npm"].includes(p.source?.source)) problems.push(`${p.name}: unknown source type`);
    if (p.source?.source === "local" && !String(p.source.path ?? "").startsWith("./")) problems.push(`${p.name}: local path must start with ./`);
    if (!["AVAILABLE", "INSTALLED_BY_DEFAULT", "NOT_AVAILABLE"].includes(p.policy?.installation)) problems.push(`${p.name}: policy.installation`);
    if (!["ON_INSTALL", "ON_USE"].includes(p.policy?.authentication)) problems.push(`${p.name}: policy.authentication`);
    if (typeof p.category !== "string") problems.push(`${p.name}: category is required`);
  }
  if (!(m.plugins ?? []).length) problems.push("plugins[] is empty");
  assert.deepEqual(problems, []);
});

// ---------------------------------------------------------------- versions.json
const VERSIONS_FILE = "skills/ice-engines/references/versions.json";

test("versions.json shape and dates", () => {
  const v = readJson(VERSIONS_FILE);
  const today = new Date().toISOString().slice(0, 10);
  assert.match(v.last_verified, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(v.last_verified <= today, "last_verified is in the future");
  for (const k of ["node", "python", "ffmpeg"]) assert.match(v.runtimes?.[k]?.minimum ?? "", /^\d+(\.\d+)*$/, `runtimes.${k}.minimum`);
  for (const [name, e] of Object.entries(v.npm)) assert.match(e.version ?? "", /^\d+\.\d+\.\d+$/, `npm ${name} must be an exact version`);
  for (const [name, e] of Object.entries(v.pip)) assert.match(e.version ?? "", /^\d+(\.\d+)+$/, `pip ${name} must be an exact version`);
  const ps = v.platform_specs;
  assert.ok(Number.isInteger(ps.max_age_days) && ps.max_age_days > 0);
  assert.ok(existsSync(abs(ps.source)), `${ps.source} does not exist`);
  for (const [name, p] of Object.entries(ps.platforms)) {
    if (p.last_verified !== null) assert.match(p.last_verified, /^\d{4}-\d{2}-\d{2}$/, `${name}.last_verified`);
    if (p.last_verified) assert.ok(p.last_verified <= today, `${name}.last_verified is in the future`);
  }
});

test("requirements.txt files are exact pins that match versions.json", () => {
  const pip = readJson(VERSIONS_FILE).pip;
  const problems = [];
  const reqs = repoFiles().filter((f) => /^skills\/[^/]+\/scripts\/requirements\.txt$/.test(f));
  assert.ok(reqs.length > 0, "no requirements.txt found");
  for (const f of reqs) {
    const skill = f.split("/")[1];
    readText(f).split(/\r?\n/).forEach((raw, i) => {
      const line = raw.replace(/\s+#.*$/, "").trim();
      if (!line || line.startsWith("#")) return;
      const m = /^([A-Za-z0-9._-]+)==([0-9][0-9A-Za-z.]*)$/.exec(line);
      if (!m) { problems.push(`${f}:${i + 1} "${line}" is not an exact pin (name==version)`); return; }
      const e = pip[m[1].toLowerCase()];
      if (!e) problems.push(`${f}:${i + 1} ${m[1]} is not in versions.json pip`);
      else {
        if (e.version !== m[2]) problems.push(`${f}:${i + 1} ${m[1]}==${m[2]} but versions.json says ${e.version}`);
        if (!e.skills?.includes(skill)) problems.push(`${f}:${i + 1} versions.json pip.${m[1]}.skills does not list ${skill}`);
      }
    });
  }
  assert.deepEqual(problems, []);
});

test("exact pins written anywhere in skills match versions.json", () => {
  const v = readJson(VERSIONS_FILE);
  const npmNames = Object.keys(v.npm).sort((a, b) => b.length - a.length);
  const pipNames = Object.keys(v.pip);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const npmRe = new RegExp(`(?<![\\w@/.-])(${npmNames.map(esc).join("|")})@(\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z]+(?:\\.[0-9A-Za-z]+)*)?)`, "g");
  const pipRe = new RegExp(`(?<![\\w.-])(${pipNames.map(esc).join("|")})==(\\d+(?:\\.[0-9A-Za-z]+)*)`, "gi");
  const problems = [];
  const files = repoFiles().filter((f) => f.startsWith("skills/") && /\.(md|mjs|js|cjs|py|json|ya?ml|html|txt|toml)$/i.test(f) && !f.endsWith("versions.json"));
  for (const f of files) {
    const lines = readText(f).split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const m of line.matchAll(npmRe)) {
        const want = v.npm[m[1]].version;
        if (m[2] !== want) problems.push(`${f}:${i + 1} ${m[1]}@${m[2]} (versions.json npm: ${want})`);
      }
      for (const m of line.matchAll(pipRe)) {
        const want = v.pip[m[1].toLowerCase()].version;
        if (m[2] !== want) problems.push(`${f}:${i + 1} ${m[1]}==${m[2]} (versions.json pip: ${want})`);
      }
    });
  }
  assert.deepEqual(problems, []);
});

test("PEP 723 script metadata with pinned packages respects the Python minimum", () => {
  const min = readJson(VERSIONS_FILE).runtimes.python.minimum;
  const problems = [];
  for (const f of repoFiles().filter((x) => x.startsWith("skills/") && x.endsWith(".py"))) {
    const text = readText(f);
    const m = /^# requires-python = "([^"]+)"/m.exec(text);
    if (!m || !/^# dependencies = \[\s*"/m.test(text)) continue;
    const lower = /^>=\s*(\d+\.\d+)/.exec(m[1]);
    const cmp = (a, b) => { const [x, y] = [a, b].map((s) => s.split(".").map(Number)); return x[0] - y[0] || x[1] - y[1]; };
    if (!lower || cmp(lower[1], min) < 0) problems.push(`${f}: requires-python "${m[1]}" is below the minimum ${min}`);
  }
  assert.deepEqual(problems, []);
});
