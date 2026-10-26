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
