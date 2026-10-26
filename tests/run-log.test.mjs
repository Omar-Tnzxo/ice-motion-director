// Run log: `ice-state.mjs log` (ice/log/conversation.jsonl) and its export by export-case-study.mjs (the
// "conversation" list in case-study.json and the self-contained ice/case-study/run-log.html), on temp fixture
// projects with no network. With ffmpeg on PATH it also embeds a preview of a generated final film.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { deflateSync } from "node:zlib";
import { abs, hasCommand } from "./helpers.mjs";

const FFMPEG = hasCommand("ffmpeg") && hasCommand("ffprobe");
const work = mkdtempSync(join(tmpdir(), "ice run log "));
after(() => rmSync(work, { recursive: true, force: true }));
const project = join(work, "client project");
const outside = join(work, "downloads");
mkdirSync(project, { recursive: true });
mkdirSync(outside, { recursive: true });

const stateTool = (...args) => spawnSync(process.execPath, [abs("skills/ice-motion-director/scripts/ice-state.mjs"), ...args, "--dir", project], { encoding: "utf8", timeout: 60000 });
const exporter = (dir) => spawnSync(process.execPath, [abs("skills/ice-qa/scripts/export-case-study.mjs"), "--project", dir], { encoding: "utf8", timeout: 300000 });
const logLines = () => readFileSync(join(project, "ice", "log", "conversation.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));

// A small valid PNG, built by hand so the test needs no image tool.
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function png(w, h, [r, g, b]) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.alloc(1 + w * 3);
  for (let x = 0; x < w; x++) { row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b; }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.concat(Array.from({ length: h }, () => row)))), chunk("IEND", Buffer.alloc(0))]);
}

// Fake secrets are assembled at run time so secret scanners do not flag this file.
const fakeKey = ["sk", "Zx9Qw3Er5Ty7Ui1Op2As4Df6"].join("-");
const fakeMail = ["someone", "example.com"].join("@");
const fakePhone = "+20 100 123 4567";
const outsidePath = process.platform === "win32" ? "C:\\Users\\someone\\Desktop\\logo.png" : "/Users/someone/Desktop/logo.png";

test("ice-state.mjs log: entries, stage, attachments, caps and refusals", () => {
  const prompt = `Make a launch ad for our app. مرحبا بكم. Key ${fakeKey}, mail ${fakeMail}, phone ${fakePhone}, logo at ${outsidePath}, frame at ${join(project, "ice", "plan", "a.png")}`;
  let r = stateTool("log", "--from", "user", "--text", prompt);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(logLines()[0].stage, "01", "before init the run is at stage 01");
  assert.equal(logLines()[0].text, prompt, "user words are stored in full and verbatim");

  assert.equal(stateTool("init", "--project", "demo", "--route", "film", "--mode", "step").status, 0);
  assert.equal(stateTool("set", "current", "05").status, 0);
  const shot = join(outside, "screen shot.png");
  writeFileSync(shot, png(64, 48, [200, 40, 40]));
  mkdirSync(join(project, "ice", "plan", "style-frames"), { recursive: true });
  const frame = join(project, "ice", "plan", "style-frames", "frame-01.png");
  writeFileSync(frame, png(96, 54, [30, 90, 160]));
  r = stateTool("log", "--from", "user", "--text", "Use this screen.", "--attach", shot);
  assert.equal(r.status, 0, r.stderr);
  r = stateTool("log", "--from", "agent", "--text", "Sent the first style frame for review.", "--attach", frame);
  assert.equal(r.status, 0, r.stderr);
  const [, fromUser, fromAgent] = logLines();
  assert.equal(fromUser.stage, "05", "the stage comes from ice/state.json");
  assert.match(fromUser.attachments[0].path, /^ice\/log\/media\/0002-screen-shot\.png$/, "an outside file is copied into ice/log/media/");
  assert.ok(existsSync(join(project, ...fromUser.attachments[0].path.split("/"))));
  assert.deepEqual(fromUser.attachments[0], { path: fromUser.attachments[0].path, kind: "image", direction: "from_user" });
  assert.deepEqual(fromAgent.attachments, [{ path: "ice/plan/style-frames/frame-01.png", kind: "image", direction: "to_user" }], "a file inside the project is referenced, not copied");

  const before = logLines().length;
  r = stateTool("log", "--from", "agent", "--text", "word ".repeat(200));
  assert.equal(r.status, 1, "an agent reply over the cap is refused");
  assert.match(r.stderr, /1 to 3 sentences/);
  assert.equal(logLines().length, before, "a refused entry writes nothing");

  r = stateTool("log", "--from", "user", "--text", "x", "--attach", join(outside, "pasted only in chat.png"));
  assert.equal(r.status, 2, "a missing attachment is refused");
  assert.match(r.stderr, /--note/);
  assert.equal(stateTool("log", "--from", "user", "--note", "A phone screenshot of a competitor ad with a red banner.").status, 0);

  const long = "سطر طويل من المستخدم. ".repeat(260);
  assert.ok(long.length > 4000);
  assert.equal(stateTool("log", "--from", "user", "--text", long).status, 0);
  const last = logLines().pop();
  assert.equal(last.text, "");
  assert.equal(last.text_file, "ice/log/messages/0005.md");
  assert.equal(readFileSync(join(project, "ice", "log", "messages", "0005.md"), "utf8"), long, "nothing is lost");
  assert.equal(stateTool("log", "--from", "robot", "--text", "x").status, 2);
});

test("export-case-study.mjs: conversation, masking and a self-contained run-log.html", () => {
  if (FFMPEG) {
    mkdirSync(join(project, "ice", "renders", "final"), { recursive: true });
    const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=640x360:rate=30:duration=2", "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", join(project, "ice", "renders", "final", "demo-final.mp4")], { encoding: "utf8" });
    assert.equal(mk.status, 0, mk.stderr);
  }
  const r = exporter(project);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const html = readFileSync(join(project, "ice", "case-study", "run-log.html"), "utf8");
  const study = JSON.parse(readFileSync(join(project, "ice", "case-study", "case-study.json"), "utf8"));

  assert.doesNotMatch(html, /(?:src|href|poster)\s*=\s*["']?\s*(?:https?:)?\/\//i, "no network source or link");
  assert.doesNotMatch(html, /url\(\s*["']?\s*(?:https?:)?\/\//i);
  assert.doesNotMatch(html, /<script|<link|<iframe/i, "no scripts, stylesheets or frames");
  assert.match(html, /<div class="text" dir="auto">/);
  assert.match(html, /src="data:image\/(webp|png);base64,/, "images are embedded");
  if (FFMPEG) assert.match(html, /<video [^>]*src="data:video\/mp4;base64,/, "the final film preview is embedded");
  assert.ok(html.indexOf("The conversation") < html.indexOf("<h2>Images</h2>"), "media come last");
  assert.ok(Buffer.byteLength(html) <= 8 * 1024 * 1024);

  for (const secret of [fakeKey, fakeMail, fakePhone, outsidePath, project]) {
    assert.ok(!html.includes(secret), `run-log.html leaks ${secret}`);
    assert.ok(!JSON.stringify(study.conversation).includes(secret), `case-study.json leaks ${secret}`);
  }
  assert.match(html, /\[key masked\].*\[email masked\].*\[phone masked\].*logo\.png.*ice\/plan\/a\.png/s, "paths are cut to the file name or the project path");
  assert.ok(readFileSync(join(project, "ice", "log", "conversation.jsonl"), "utf8").includes(fakeKey), "the local log stays verbatim");
  assert.ok(study.notes.some((n) => /masked in the export: [1-9]\d* keys/.test(n.note)));

  assert.equal(study.conversation.length, 5);
  assert.deepEqual(Object.keys(study.conversation[0]), ["at", "stage", "from", "text", "note", "attachments"]);
  assert.ok(study.conversation[4].text.length > 4000, "long text is read back from ice/log/messages/");
  assert.equal(study.conversation[1].attachments[0].direction, "from_user");
  assert.match(study.conversation[1].attachments[0].path, /^(media\/|ice\/log\/media\/)/);
  const size = Buffer.byteLength(html);
  console.log(`run-log.html fixture size: ${size} bytes (${(size / 1048576).toFixed(2)} MB), ffmpeg ${FFMPEG ? "on" : "off"}`);
});

test("export-case-study.mjs: images shared in the conversation come right after the final result", () => {
  const dir = join(work, "priority project");
  const tool = (...args) => spawnSync(process.execPath, [abs("skills/ice-motion-director/scripts/ice-state.mjs"), ...args, "--dir", dir], { encoding: "utf8", timeout: 60000 });
  mkdirSync(join(dir, "ice", "plan", "style-frames"), { recursive: true });
  // More unsent style frames than the cap allows, written first so they are the oldest files.
  for (let i = 0; i < 30; i++) writeFileSync(join(dir, "ice", "plan", "style-frames", `old-${String(i).padStart(2, "0")}.png`), png(40, 30, [i * 8, 100, 200 - i * 5]));
  mkdirSync(join(dir, "temp"), { recursive: true });
  mkdirSync(join(dir, "ice", "review", "stills"), { recursive: true });
  const shared = [join(dir, "temp", "draft-contact.png"), join(dir, "ice", "review", "stills", "cues.png"), join(dir, "ice", "plan", "style-frames", "old-29.png")];
  shared.forEach((f, i) => { if (!existsSync(f)) writeFileSync(f, png(48, 27, [250, 20 * i, 60])); });
  const sharedVideo = join(dir, "ice", "renders", "draft-3.mp4");
  if (FFMPEG) {
    mkdirSync(join(dir, "ice", "renders"), { recursive: true });
    const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=25:duration=2", "-c:v", "libx264", "-pix_fmt", "yuv420p", sharedVideo], { encoding: "utf8" });
    assert.equal(mk.status, 0, mk.stderr);
  }
  assert.equal(tool("log", "--from", "user", "--text", "Here is my contact sheet.", "--attach", shared[0]).status, 0);
  const agentFiles = FFMPEG ? [sharedVideo, shared[1], shared[2]] : [shared[1], shared[2]];
  assert.equal(tool("log", "--from", "agent", "--text", "Sent the draft and its cue stills.", ...agentFiles.flatMap((f) => ["--attach", f])).status, 0);

  const r = exporter(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const html = readFileSync(join(dir, "ice", "case-study", "run-log.html"), "utf8");
  const figures = [...html.matchAll(/<figure id="(m\d+)"><img [^>]*alt="([^"]*)"/g)].map((m) => ({ id: m[1], caption: m[2] }));
  assert.ok(figures.length <= 24, `${figures.length} images; 24 at most`);
  const names = ["draft-contact.png", "cues.png", "old-29.png", ...(FFMPEG ? ["draft-3.mp4"] : [])];
  for (const [i, name] of names.entries()) {
    const fig = figures.findIndex((f) => f.caption.includes(name));
    assert.ok(fig >= 0 && fig < names.length, `${name} is embedded among the first images (index ${fig})`);
    const link = html.match(new RegExp(`<li><a href="#(m\\d+)">${name.replace(/\./g, "\\.")}</a>`));
    assert.ok(link, `the conversation line of ${name} links to its image`);
    assert.equal(link[1], figures[fig].id);
    if (i === 2) assert.equal(figures.filter((f) => f.caption.includes(name)).length, 1, "a shared style frame is embedded once");
  }
  assert.ok(figures.some((f) => /Style frame/.test(f.caption)), "unsent style frames fill the remaining places");
});

test("export-case-study.mjs: raw UI-fidelity sheets stay local, only masked share sheets are exported", () => {
  const dir = join(work, "fidelity project");
  const tool = (...args) => spawnSync(process.execPath, [abs("skills/ice-motion-director/scripts/ice-state.mjs"), ...args, "--dir", dir], { encoding: "utf8", timeout: 60000 });
  const put = (rel, rgb) => { const f = join(dir, ...rel.split("/")); mkdirSync(join(f, ".."), { recursive: true }); writeFileSync(f, png(64, 36, rgb)); return f; };
  const raw = put("temp/fidelity/home_raw.png", [255, 0, 0]);
  const share = put("ice/review/fidelity/home_share.png", [0, 255, 0]);
  put("ice/review/ui-fidelity/sheet-en-v2.png", [255, 0, 255]);
  put("ice/review/fidelity/search_raw.png", [255, 128, 0]);
  const listed = put("ice/review/checks/pricing-side-by-side.png", [128, 0, 255]);
  mkdirSync(join(dir, "ice", "assets"), { recursive: true });
  writeFileSync(join(dir, "ice", "assets", "manifest.json"), JSON.stringify({ assets: [
    { path: "src/home.html", kind: "ui", fidelity: { score: 0.94, checked_by: "critic", sheet: "temp/fidelity/home_raw.png", share_sheet: "ice/review/fidelity/home_share.png" } },
    { path: "src/pricing.html", kind: "ui", fidelity: [{ against: "x.png", score: 0.92, checked_by: "critic", sheet: "ice/review/checks/pricing-side-by-side.png" }] },
  ] }));
  assert.equal(tool("log", "--from", "agent", "--text", "Sent the fidelity check.", "--attach", raw, "--attach", share, "--attach", listed).status, 0);

  const r = exporter(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const html = readFileSync(join(dir, "ice", "case-study", "run-log.html"), "utf8");
  const study = JSON.parse(readFileSync(join(dir, "ice", "case-study", "case-study.json"), "utf8"));
  const captions = [...html.matchAll(/<figure id="m\d+"><img [^>]*alt="([^"]*)"/g)].map((m) => m[1]);
  for (const name of ["home_raw", "sheet-en-v2", "search_raw", "pricing-side-by-side"]) {
    assert.ok(!captions.some((c) => c.includes(name)), `${name} must not be embedded`);
    assert.ok(!readdirSync(join(dir, "ice", "case-study", "media")).some((f) => f.includes(name)), `${name} must not be copied to case study media`);
  }
  assert.match(html, /<li>home_raw\.png: raw fidelity sheet kept local<\/li>/);
  assert.match(html, /<li>pricing-side-by-side\.png: raw fidelity sheet kept local<\/li>/);
  assert.match(html, /<li><a href="#m\d+">home_share\.png<\/a>/, "the masked share copy is embedded and linked");
  assert.deepEqual(study.conversation[0].attachments[0], { path: "", kind: "text", direction: "to_user", note: "raw fidelity sheet kept local" });
  const excluded = study.notes.filter((n) => /raw fidelity sheet kept local/.test(n.note)).map((n) => n.note).join("\n");
  for (const name of ["home_raw.png", "sheet-en-v2.png", "search_raw.png", "pricing-side-by-side.png"]) assert.ok(excluded.includes(name), `a note names ${name}`);
});

test("export-case-study.mjs: a run without a log still exports, with a note", () => {
  const bare = join(work, "no log project");
  mkdirSync(join(bare, "ice"), { recursive: true });
  const r = exporter(bare);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const study = JSON.parse(readFileSync(join(bare, "ice", "case-study", "case-study.json"), "utf8"));
  assert.deepEqual(study.conversation, []);
  assert.ok(study.notes.some((n) => n.field === "conversation" && /no run log/.test(n.note)));
  const html = readFileSync(join(bare, "ice", "case-study", "run-log.html"), "utf8");
  assert.match(html, /This run kept no run log/);
});

test("export-case-study.mjs: a recipe-only run exports the recipe, not a missing film", () => {
  // the shape of a real recipe-only run (ice-remake references/style-recipe.md section 8): order 01 10, no film
  const dir = join(work, "recipe only project");
  const ref = join(dir, "ice", "reference", "ref-a");
  mkdirSync(join(ref, "analysis"), { recursive: true });
  mkdirSync(join(ref, "evidence"), { recursive: true });
  mkdirSync(join(dir, "ice", "log"), { recursive: true });
  const stages = Object.fromEntries(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"].map((id) =>
    [id, ["01", "10"].includes(id) ? { status: "approved", artifact: id === "10" ? "ice/reference/ref-a/STYLE-RECIPE.md" : "", notes: `stage ${id} done`, minutes: 5, roles: ["director"] }
      : { status: "not_used", artifact: "", notes: "left out of the stage order" }]));
  writeFileSync(join(dir, "ice", "state.json"), JSON.stringify({ project: "ref-a", route: "remake", subtype: "recipe", mode: "auto", size: "not_applicable",
    order: ["01", "10"], run_mode: "recipe-only", created: "2026-10-22T06:00:00Z", stages, approvals: [{ at: "2026-10-22T07:00:00Z", stage: "10" }] }));
  const promptText = "Use Ice Motion Director with the style recipe ice/reference/ref-a/STYLE-RECIPE.md.\nSlots:\n- content: OPEN";
  writeFileSync(join(ref, "STYLE-RECIPE.md"), `# Style recipe: ref-a\n\n## 1. Header\n\nMade 2026-10-22.\n\n## 2. Measured grammar\n\nCuts.\n\n## 7. Prompt block\n\n\`\`\`text\n${promptText}\n\`\`\`\n\n## Unknowns\n\n- sound.music.genre: confirm by a listen\n`);
  writeFileSync(join(ref, "style-recipe.json"), JSON.stringify({ version: 1, ref_id: "ref-a", prompt: promptText, open_slots: ["content"] }));
  writeFileSync(join(ref, "sound-map.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect width="120" height="40" fill="#eaf2f8"/></svg>');
  writeFileSync(join(ref, "analysis", "sheet_1fps.png"), png(64, 36, [40, 40, 40]));
  writeFileSync(join(ref, "evidence", "strip_0_0-1_0.png"), png(64, 16, [90, 160, 90]));
  writeFileSync(join(dir, "ice", "log", "conversation.jsonl"), JSON.stringify({ at: "2026-10-22T06:00:00Z", stage: "01", from: "user", text: "Make a style recipe from this video." }) + "\n");

  const r = exporter(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /recipe-only run, recipe ice\/reference\/ref-a\/STYLE-RECIPE\.md \(4 sections, 3 pictures\), 2\/2 stages with artifacts/);
  const study = JSON.parse(readFileSync(join(dir, "ice", "case-study", "case-study.json"), "utf8"));
  assert.equal(study.run_mode, "recipe-only");
  assert.equal(study.recipe.file, "ice/reference/ref-a/STYLE-RECIPE.md");
  assert.deepEqual(study.recipe.sections, ["1. Header", "2. Measured grammar", "7. Prompt block", "Unknowns"]);
  assert.equal(study.recipe.prompt, promptText);
  assert.deepEqual(study.recipe.unknowns, ["sound.music.genre: confirm by a listen"]);
  assert.equal(study.recipe.sound_map, "ice/reference/ref-a/sound-map.svg");
  assert.deepEqual(study.recipe.sheets, ["ice/reference/ref-a/analysis/sheet_1fps.png", "ice/reference/ref-a/evidence/strip_0_0-1_0.png"]);
  const s10 = study.stages.find((s) => s.id === "10");
  assert.ok(s10.artifacts.some((a) => /STYLE-RECIPE/.test(a.path)), "stage 10 carries the recipe");
  const film = study.notes.filter((n) => /^(versions|metrics|gates|credits|research|stages\[0[2-9]\])/.test(n.field) || /no final film/.test(n.note));
  assert.deepEqual(film, [], "no film field is noted as missing in a recipe-only run");
  assert.ok(study.notes.some((n) => n.field === "recipe" && /no film was made/.test(n.note)));

  const html = readFileSync(join(dir, "ice", "case-study", "run-log.html"), "utf8");
  assert.match(html, /<h2>The recipe<\/h2>/);
  assert.doesNotMatch(html, /<h2>Final result<\/h2>/);
  assert.match(html, /Use Ice Motion Director with the style recipe/);
  assert.match(html, /The recipe: sound map and the sheets the agent watched/);
  assert.match(html, /data:image\/svg\+xml;base64,/, "the sound map picture is embedded");
  assert.doesNotMatch(html, /<script/i);
});
