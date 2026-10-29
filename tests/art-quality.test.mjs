// Art quality (founder decision, 2026-10-22): skills/ice-qa/scripts/art-check.mjs fails a primitive flat object and
// passes a shaded, textured one; the ladder of art sources and the auto-trace limit are documented; vectorize.py writes
// one named group per colour region. Fixture pages are written to a temp folder. The art check skips when no Chrome or
// Edge is found (set CHROME_PATH); the vectorizer test skips when Python or vtracer is missing.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { crc32, deflateSync } from "node:zlib";
import { after, test } from "node:test";
import { abs, findPython, readText } from "./helpers.mjs";

const ART = abs("skills/ice-qa/scripts/art-check.mjs");
const probe = spawnSync(process.execPath, ["--input-type=module", "-e",
  `const m = await import(${JSON.stringify(pathToFileURL(abs("skills/ice-qa/scripts/_cdp.mjs")).href)}); console.log(m.findChrome());`], { encoding: "utf8" });
const NO_CHROME = probe.status === 0 ? false : "Chrome or Edge not found (set CHROME_PATH)";

const dir = mkdtempSync(join(tmpdir(), "ice-art-quality-"));
after(() => rmSync(dir, { recursive: true, force: true }));

const page = (name, svg, bodyAttr = "") => {
  const f = join(dir, name + ".html");
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#e9e4d8}
</style></head><body${bodyAttr}><svg width="1920" height="1080" viewBox="0 0 1920 1080">${svg}</svg></body></html>`);
  return f;
};
const check = (file) => {
  const r = spawnSync(process.execPath, [ART, file, "--json"], { encoding: "utf8", timeout: 120000 });
  assert.ok(r.status === 0 || r.status === 1, `art-check.mjs exit ${r.status}: ${r.stderr}`);
  return { ...JSON.parse(r.stdout), exit: r.status };
};

// one red box body, a cabin and two black wheels: one tone per part, no shading, texture or shadow
const FLAT = `<g id="car" data-art-hero="car">
<rect x="600" y="500" width="700" height="200" fill="#d23b3b"/><rect x="750" y="400" width="400" height="120" fill="#d23b3b"/>
<circle cx="750" cy="720" r="70" fill="#222"/><circle cx="1150" cy="720" r="70" fill="#222"/></g>`;

// the same object built to the craft rules: gradient body, shadow and highlight tones, parts, grain, cast shadow
const wheel = (id, cx) => `<g id="${id}"><circle cx="${cx}" cy="720" r="70" fill="#222"/><circle cx="${cx}" cy="720" r="40" fill="#8a8a8a"/>
<circle cx="${cx}" cy="720" r="12" fill="#cfcfcf"/><path d="M${cx - 30} 700 L${cx + 30} 740 M${cx + 30} 700 L${cx - 30} 740" stroke="#555" stroke-width="5"/></g>`;
const CRAFTED = `<defs><linearGradient id="paint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8605a"/>
<stop offset=".55" stop-color="#c73a36"/><stop offset="1" stop-color="#8e2422"/></linearGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" seed="3"/><feColorMatrix type="saturate" values="0"/>
<feComponentTransfer><feFuncA type="linear" slope=".18"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
<ellipse id="car-shadow" cx="950" cy="792" rx="420" ry="26" fill="#2a2418" fill-opacity=".35"/>
<g id="car" data-art-hero="car"><g id="body">
<path d="M600 700 L600 560 Q600 500 660 500 L1240 500 Q1300 500 1300 560 L1300 700 Z" fill="url(#paint)"/>
<path d="M610 690 L1290 690 L1290 700 L610 700 Z" fill="#6e1b1a"/><path d="M620 515 L1280 515 L1280 525 L620 525 Z" fill="#f7a39b"/>
<path d="M760 500 L820 400 L1100 400 L1160 500 Z" fill="#b8332f"/>
<path d="M790 495 L835 415 L950 415 L950 495 Z M965 495 L965 415 L1090 415 L1135 495 Z" fill="#9fd0e8"/>
<path d="M800 490 L840 420 L860 420 L825 490 Z" fill="#e6f5fb"/>
<rect x="640" y="590" width="40" height="18" fill="#ffd27a"/><rect x="1230" y="590" width="40" height="18" fill="#ff8a6a"/>
<rect x="900" y="600" width="60" height="6" fill="#5b1615"/><rect x="1040" y="600" width="60" height="6" fill="#5b1615"/>
<circle cx="700" cy="640" r="4" fill="#3a0f0e"/><circle cx="1200" cy="640" r="4" fill="#3a0f0e"/><circle cx="950" cy="560" r="3" fill="#3a0f0e"/>
<path d="M950 505 L950 690" stroke="#7a1f1e" stroke-width="3" fill="none"/></g>
${wheel("wheel-front", 750)}${wheel("wheel-rear", 1150)}
<rect id="car-grain" x="600" y="400" width="710" height="390" filter="url(#grain)" fill="#000"/></g>`;

test("the art check fails a primitive flat object", { skip: NO_CHROME }, () => {
  const out = check(page("flat", FLAT));
  assert.equal(out.gate, "FAIL");
  assert.equal(out.exit, 1);
  const car = out.objects.find((o) => o.name === "car");
  assert.ok(car, "the marked hero object is measured");
  assert.ok(car.tones < 3, `tones ${car.tones}`);
  for (const k of ["tones", "shading", "shapes", "texture", "shadow"]) assert.equal(car.measures[k].status, "FAIL", `${k}: ${car.measures[k].note}`);
});

test("the art check passes a shaded, textured object with a cast shadow", { skip: NO_CHROME }, () => {
  const out = check(page("crafted", CRAFTED));
  assert.equal(out.gate, "PASS", JSON.stringify(out.objects.map((o) => o.measures)));
  assert.equal(out.exit, 0);
  const car = out.objects.find((o) => o.name === "car");
  assert.ok(car.tones >= 3 && car.shapes >= 24, `tones ${car.tones}, shapes ${car.shapes}`);
});

test("the art check: a declared style exemption is a lead, unmarked drawn art fails, no art is N/A", { skip: NO_CHROME }, () => {
  const declared = check(page("declared", CRAFTED.replace('data-art-hero="car"', 'data-art-hero="car" data-art-texture="none: Swiss grid style, no texture"')
    .replace(/<rect id="car-grain"[^>]*\/>/, "")));
  assert.equal(declared.gate, "WARN");
  assert.equal(declared.objects[0].measures.texture.status, "WARN");
  const shapes = Array.from({ length: 14 }, (_, i) => `<rect x="${100 + i * 120}" y="900" width="60" height="60" fill="#556"/>`).join("");
  const unmarked = check(page("unmarked", shapes));
  assert.equal(unmarked.gate, "FAIL", "drawn objects with no hero object measured fail (unmeasured is never n/a)");
  assert.equal(check(page("empty", "")).gate, "N/A");
});

test("the ladder of art sources and the auto-trace limit are documented", () => {
  const src = readText("skills/ice-assets/references/sourcing-and-licenses.md");
  const at = src.indexOf("## 1b. The ladder of art sources");
  assert.ok(at > 0, "sourcing-and-licenses.md has section 1b");
  const ladder = src.slice(at, src.indexOf("## 2.", at));
  const order = ["The user's own art", "Licensed vector or illustration libraries", "AI-generated art, only when the user starts it", "3D with real lighting", "Hand-coded SVG"];
  const pos = order.map((s) => ladder.indexOf(s));
  pos.forEach((p, i) => assert.ok(p > 0, `the ladder names: ${order[i]}`));
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, "the rungs are in order");
  assert.match(ladder, /auto-traced image moves as one piece/);
  assert.match(ladder, /cannot be animated separately unless it is rebuilt by parts/);
  assert.match(readText("skills/ice-assets/references/asset-rules.md"), /sourcing-and-licenses\.md` section 1b/);
  const craft = readText("skills/ice-styles/references/code-illustration-craft.md");
  for (const h of ["Construction", "Value and light", "Surface", "Line", "Depth", "Animation-ready structure", "Production method"]) assert.match(craft, new RegExp(`^## \\d+\\. ${h}$`, "m"), `craft heading ${h}`);
  assert.match(readText("skills/ice-styles/references/style-method.md"), /code-illustration-craft\.md/);
  assert.match(readText("skills/ice-qa/references/pre-render-lint.md"), /## 4b\. Art check/);
});

const PY = findPython();
const hasVtracer = PY && spawnSync(PY[0], [...PY.slice(1), "-c", "import vtracer"], { stdio: "ignore" }).status === 0;
test("vectorize.py writes one named group per colour region", { skip: !PY ? "Python 3 not found" : !hasVtracer ? "vtracer not installed (skills/ice-assets/scripts/requirements.txt)" : false }, () => {
  // a 3-colour PNG built here (no imaging library): background, a red block, a blue block
  const W = 120, H = 80, rows = [];
  for (let y = 0; y < H; y++) {
    const row = Buffer.alloc(1 + W * 3);
    for (let x = 0; x < W; x++) {
      const c = x >= 10 && x < 50 && y >= 15 && y < 65 ? [200, 40, 40] : x >= 65 && x < 110 && y >= 20 && y < 60 ? [30, 60, 140] : [240, 236, 220];
      c.forEach((v, k) => { row[1 + x * 3 + k] = v; });
    }
    rows.push(row);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4), crc = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type), data]);
    len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr.set([8, 2, 0, 0, 0], 8);
  const img = join(dir, "blocks.png"), svg = join(dir, "blocks.svg");
  writeFileSync(img, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(rows))), chunk("IEND", Buffer.alloc(0))]));
  const v = spawnSync(PY[0], [...PY.slice(1), abs("skills/ice-assets/scripts/vectorize.py"), img, "-o", svg], { encoding: "utf8", timeout: 120000 });
  assert.equal(v.status, 0, v.stderr);
  const out = JSON.parse(v.stdout);
  assert.equal(out.groups.length, 3, JSON.stringify(out.groups));
  const text = readFileSync(svg, "utf8");
  assert.match(text, /data-source="auto-trace"/);
  for (const g of out.groups) assert.match(text, new RegExp(`<g id="${g.id}" data-color="${g.color}"`));
  assert.equal(out.groups[0].color, "#f0ecdc", "the largest region (the background) is first");
  assert.match(out.note, /moves as one piece/);
});

// Craft profiles (0.2.5, lesson L21 "every style states its craft needs"): every style family carries one family default
// line, entries add their own line in the same closed vocabulary, and style-method.md defines the field and the lock line.
const STYLE_REFS = "skills/ice-styles/references/";
const FAMILY_FILES = ["family-cartoon-film.md", "family-drawing-line.md", "family-evidence-data.md", "family-games-toys.md",
  "family-graphic-design.md", "family-paint-wash.md", "family-print-paper-craft.md", "family-screen-tech-3d.md",
  "family-broadcast-news.md", "art-history-eras.md", "art-history-painters.md", "narration-grammars-1.md", "narration-grammars-2.md"];
const CRAFT_CODES = new Set(["camera", "depth", "composite", "light", "finish", "type", "transition", "data", "cutout", "sfx",
  "music", "ambience", "foley", "silence", "voice", "rhythm", "footage", "identity"]);
// the exemption rule ids the gates print (gate prefix + rule id)
const RULE_ID = /^(lint:(C[1-7]|D1|P1|T1|V[1-5]|depth_layers)|story:(\d+|filler_reason)|film:(fast_ratio|blank_run_s|blue_purple_share|hero_share|frame_fill|empty_half|depth_layers|in_shot_motion|longest_still)|art:(tones|shading|shapes)|look:G[23]|seam:zero-overlap|plan:(gap|anchor|coverage)|contract:fade|slop:(\d+|N\d+)|frame:[\w-]+)$/;
const FAMILY_LINE = "- **Craft profile (family default):**";
const ENTRY_LINE = "- **Craft profile:**";
const styleText = (f) => readText(STYLE_REFS + f).replace(/\r\n/g, "\n");

// split at a separator that sits outside parentheses
const splitTop = (s, sep) => {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  assert.equal(depth, 0, `balanced parentheses: ${s.slice(0, 80)}`);
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
};

// parse "needs: a (...), b (...); serves when: ...; never: ..." into code lists; every item is "<code> (<text>)"
const parseLists = (body, where, labels) => {
  const lists = {};
  for (const clause of splitTop(body.trim().replace(/\.$/, ""), ";")) {
    const m = clause.match(/^(needs also|serves when also|needs|serves when|never):\s*([\s\S]+)$/);
    assert.ok(m && labels.includes(m[1]), `${where}: a clause starts with one of ${labels.join(", ")}: "${clause.slice(0, 60)}"`);
    lists[m[1]] = splitTop(m[2], ",").map((item) => {
      const im = item.match(/^([a-z]+) \(([\s\S]+)\)$/);
      assert.ok(im, `${where}: item "${item.slice(0, 60)}" is "<code> (<how, trigger or reason>)"`);
      assert.ok(CRAFT_CODES.has(im[1]), `${where}: "${im[1]}" is one of the 18 craft codes`);
      assert.ok(im[2].trim().length > 2, `${where}: ${im[1]} has its text in parentheses`);
      for (const id of im[2].matchAll(/`(\w+:[\w-]+)`/g)) assert.match(id[1], RULE_ID, `${where}: ${id[1]} is a rule id the gates print`);
      return im[1];
    });
  }
  const never = lists.never || [];
  for (const k of ["needs", "needs also", "serves when", "serves when also"]) {
    for (const c of lists[k] || []) assert.ok(!never.includes(c), `${where}: ${c} is in ${k} and in never`);
  }
  return lists;
};

const familyBody = (line) => {
  const body = line.slice(FAMILY_LINE.length).trim();
  const at = body.search(/(^|: )needs: /);
  return at < 0 ? null : body.slice(at === 0 ? 0 : at + 2);
};

test("styles: every family file has one family default craft profile line in the 18 codes, every never with its reason", () => {
  for (const f of FAMILY_FILES) {
    const lines = styleText(f).split("\n").filter((l) => l.startsWith(FAMILY_LINE));
    assert.equal(lines.length, 1, `${f} has exactly one family default craft profile line`);
    const body = familyBody(lines[0]);
    if (body === null) {
      // a pointer line: it names another family file whose line holds the lists
      const target = lines[0].match(/`([\w-]+\.md)`/);
      assert.ok(target && FAMILY_FILES.includes(target[1]) && target[1] !== f, `${f}: a family line without lists points to another family file`);
      assert.ok(familyBody(styleText(target[1]).split("\n").find((l) => l.startsWith(FAMILY_LINE))), `${target[1]} holds the lists`);
      continue;
    }
    const lists = parseLists(body, f, ["needs", "serves when", "never"]);
    assert.ok((lists.needs || []).length >= 3, `${f}: the family default names at least 3 needs`);
  }
  // the directions file carries the same profile as a Craft column on both of its tables
  const dir = styleText("directions-openers-explainers.md").split("\n");
  for (const head of ["| Direction | Background |", "| Look | Background and material |"]) {
    const h = dir.findIndex((l) => l.startsWith(head));
    assert.ok(h > 0 && dir[h].trim().endsWith("| Craft |"), `the table "${head}" has a Craft column`);
    const cols = dir[h].split("|").length;
    assert.equal(dir[h + 1].split("|").length, cols, `the table "${head}" separator has the Craft column`);
    let rows = 0;
    for (let i = h + 2; i < dir.length && dir[i].startsWith("| "); i++, rows++) {
      const cells = dir[i].split(" | ");
      assert.equal(dir[i].split("|").length, cols, `row ${i + 1} has a Craft cell`);
      parseLists(cells[cells.length - 1].replace(/ \|$/, ""), `directions row "${cells[0].slice(2)}"`, ["needs", "serves when", "never"]);
    }
    assert.ok(rows >= 6, `the table "${head}" has its rows`);
  }
});

test("styles: entry craft profile lines inherit the family default, use only the 18 codes and cover every unspecified-sound and thin entry", () => {
  let entryLines = 0;
  const thin = ["### Single-line engraving", "### Crayon (`balloon`", "### Ballpoint sketch", "### Coloured pencil", "### Pen-and-ink stipple",
    "### Pencil and watercolour (`ranunculus`", "### Storybook pencil", "### Sumi-e", "### Risograph, drum by drum", "### Newsprint halftone",
    "### Ukiyo-e colour woodblock", "### Geometric / Bauhaus Motion", "### Cyberpunk HUD", "### Pixel art, cell by cell", "### Toy brick (`toyBrick`"];
  const seenThin = new Set();
  for (const f of FAMILY_FILES) {
    const lines = styleText(f).split("\n");
    const famLine = lines.find((l) => l.startsWith(FAMILY_LINE));
    const famBody = familyBody(famLine) ?? familyBody(styleText(famLine.match(/`([\w-]+\.md)`/)[1]).split("\n").find((l) => l.startsWith(FAMILY_LINE)));
    const familyNeeds = parseLists(famBody, f, ["needs", "serves when", "never"]).needs || [];
    let block = null;
    const close = () => {
      if (!block) return;
      const where = `${f} "${block.head.slice(4, 60)}"`;
      assert.ok(block.craft <= 1, `${where} has at most one craft profile line`);
      if (block.unspecifiedSound) assert.equal(block.craft, 1, `${where}: sound not specified in source, so the entry writes its craft line`);
      const t = thin.find((p) => block.head.startsWith(p));
      if (t) { assert.equal(block.craft, 1, `${where}: a thin entry writes its craft line`); seenThin.add(t); }
    };
    for (const l of lines) {
      if (l.startsWith("## ") || l.startsWith("### ")) { close(); block = { head: l, craft: 0, unspecifiedSound: false }; continue; }
      if (!block) continue;
      if (l.startsWith("- **Sound:** not specified in source")) block.unspecifiedSound = true;
      if (!l.startsWith(ENTRY_LINE)) continue;
      block.craft++;
      entryLines++;
      const body = l.slice(ENTRY_LINE.length).trim();
      assert.match(body, /^family default(;|\.?$)/, `${f}: an entry line starts with "family default"`);
      const rest = body.replace(/^family default;?/, "").trim();
      if (!rest) continue;
      const own = parseLists(rest, `${f} "${block.head.slice(4, 60)}"`, ["needs also", "serves when also", "never"]);
      for (const c of own["serves when also"] || []) {
        assert.ok(!familyNeeds.includes(c), `${f} "${block.head.slice(4, 60)}": ${c} is a family need, never moved down to serves when`);
      }
    }
    close();
  }
  assert.deepEqual([...seenThin].sort(), [...thin].sort(), "every thin entry was found");
  assert.ok(entryLines >= 68, `entries with their own line: ${entryLines}`);
});

test("styles: style-method.md requires the craft profile field and locks it with the Craft: line", () => {
  const method = styleText("style-method.md");
  const s4 = method.slice(method.indexOf("## 4. Writing the style lock"), method.indexOf("## 5."));
  const lock = s4.split("\n").find((l) => l.startsWith("- `Craft:`"));
  assert.ok(lock, "section 4 has the Craft: lock line");
  assert.match(lock, /ice\/plan\/craft-plan\.json/);
  assert.match(lock, /`style_needs`/);
  assert.match(lock, /`style_never`/);
  assert.match(lock, /source kind `style`/);
  assert.match(lock, /`ice-direction` skill, `references\/treatment\.md` section "Craft plan"/);
  const s10 = method.slice(method.indexOf("## 10. Building a new style entry"), method.indexOf("## 11."));
  assert.match(s10, /^2\. Fill the entry fields[^\n]*; Sound; Craft profile/m, "section 10 lists Craft profile among the entry fields");
  assert.match(s10, /Craft profile \(family default\):\*\* needs: <code>/);
  for (const c of CRAFT_CODES) assert.ok(s10.includes("`" + c + "`"), `section 10 names the code ${c}`);
  assert.match(readText("skills/ice-styles/SKILL.md"), /craft profile[^\n]*ice\/plan\/craft-plan\.json/);
});
