// The voice stage (0.2.20, lesson L76, founder request 2026-11-01): a narrator is the user's recording or a voice
// the agent generates with the user's own provider, directed per line, taken more than once, fitted to its frame
// slot and recorded at its source. Arabic spoken sides carry numbers as words in the film's variety (founder rule:
// "100.000" is "مية الف" in Egyptian) and the founder's Egyptian default voice. Music and effects stay real only.
// spoken_numbers.py and voice_fit.py need Python 3.10+; the --apply check also needs ffmpeg. Each skips cleanly
// when its tool is missing.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { pathToFileURL } from "node:url";
import { abs, findPython, hasCommand, readText } from "./helpers.mjs";

const PYTHON = findPython();
const FFMPEG = hasCommand("ffmpeg");
const NUMBERS = abs("skills/ice-arabic/scripts/spoken_numbers.py");
const FIT = abs("skills/ice-audio/scripts/voice_fit.py");
const work = mkdtempSync(join(tmpdir(), "ice-voice-"));
after(() => rmSync(work, { recursive: true, force: true }));

const py = (args, opts = {}) => spawnSync(PYTHON[0], [...PYTHON.slice(1), ...args], { encoding: "utf8", ...opts });

/** A tiny valid 16-bit mono WAV of n zero samples at 48 kHz (never a sound); seed changes its hash. */
function wav(n = 4800, seed = 0) {
  const data = Buffer.alloc(n * 2);
  if (seed) data.writeInt16LE(seed, 0);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(48000, 24);
  h.writeUInt32LE(96000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}
const hashOf = (buf) => createHash("sha256").update(buf).digest("hex");

const VOICE = { provider: "elevenlabs", model: "eleven_v4", voice_id: "<voice id>", voice_name: "<voice name>", access: "mcp",
  plan: "<paid plan>", license_terms: "https://provider.test/terms (read 2026-11-01)", date: "2026-11-01" };
/** One line: slot of `frames` at 30 fps, a chosen take whose words span `span` seconds. */
const line = (id, frames, span, spoken = "line") => ({ id, display: spoken, spoken, direction: { intent: "<feeling>", energy: 3, tags: ["warmly"] },
  slot: { start_frame: 0, end_frame: frames }, chosen: `${id}-t1`,
  takes: [{ id: `${id}-t1`, file: `ice/audio/voice/${id}-t1.wav`, seed: 1, words: [{ w: "a", start: 0.1, end: 0.4 }, { w: "b", start: span - 0.2, end: span + 0.1 }] }] });

function voiceProject(name, lines, voice = VOICE, extra = {}) {
  const dir = join(work, name);
  mkdirSync(join(dir, "ice", "audio", "voice"), { recursive: true });
  lines.forEach((l, i) => l.takes.forEach((t) => writeFileSync(join(dir, t.file), wav(4800, i + 1))));
  writeFileSync(join(dir, "ice", "audio", "voice", "lines.json"), JSON.stringify({ schema: "ice-voice-lines/1", route: "provider",
    language: "ar", variety: "egyptian", fps: 30, voice, lines, ...extra }));
  return dir;
}

test("Arabic numbers: Egyptian and MSA words, Egyptian separators, percent, and the digit check (founder rule)", { skip: !PYTHON && "no Python 3.10+" }, () => {
  const conv = (variety, text) => { const r = py([NUMBERS, "convert", "--variety", variety, text]); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  assert.equal(conv("egyptian", "عندنا 100.000 عميل"), "عندنا مية ألف عميل");
  assert.equal(conv("msa", "عندنا 100.000 عميل"), "عندنا مئة ألف عميل");
  assert.equal(conv("egyptian", "2.500 جنيه و25% خصم"), "ألفين وخمسمية جنيه وخمسة وعشرين في المية خصم");
  assert.equal(conv("msa", "25%"), "خمسة وعشرون بالمئة");
  assert.equal(conv("egyptian", "2,5"), "اتنين ونص");
  assert.equal(conv("egyptian", "3000 و11000"), "تلات تلاف وحداشر ألف");
  assert.equal(conv("msa", "3000 و11000 و1.000.000"), "ثلاثة آلاف وأحد عشر ألفًا ومليون");
  assert.equal(conv("egyptian", "٤٥ دقيقة"), "خمسة وأربعين دقيقة");
  const dir = voiceProject("digits", [line("L01", 60, 2, "عندنا 100.000 عميل")]);
  const r = py([NUMBERS, "check", join(dir, "ice", "audio", "voice", "lines.json")]);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /line L01: the spoken side still has digits/);
});

test("voice_fit words: ElevenLabs character timings become words with tags dropped; whisper segments too", { skip: !PYTHON && "no Python 3.10+" }, () => {
  const chars = [..."[warmly] hi you"];
  const answer = { alignment: { characters: chars, character_start_times_seconds: chars.map((_, i) => i * 0.1),
    character_end_times_seconds: chars.map((_, i) => i * 0.1 + 0.1) } };
  const f = join(work, "answer.json");
  writeFileSync(f, JSON.stringify(answer));
  let r = py([FIT, "words", f]);
  assert.equal(r.status, 0, r.stderr);
  const words = JSON.parse(r.stdout);
  assert.deepEqual(words.map((w) => w.w), ["hi", "you"]);
  assert.equal(words[0].start, 0.9);
  writeFileSync(f, JSON.stringify({ segments: [{ words: [{ word: " one", start: 0, end: 0.3 }, { word: " two", start: 0.4, end: 0.7 }] }] }));
  r = py([FIT, "words", f]);
  assert.deepEqual(JSON.parse(r.stdout).map((w) => w.w), ["one", "two"]);
});

test("voice_fit fit: ok, stretch, a one-line exception, rewrite outside 0.85 to 1.10 and two exceptions in a row", { skip: !PYTHON && "no Python 3.10+" }, () => {
  // 60 frames at 30 fps is a 2 s slot; the speech span (first start to last end) equals the third argument
  const lines = [line("L01", 60, 2.0), line("L02", 60, 2.1), line("L03", 60, 2.18), line("L04", 60, 2.4), line("L05", 60, 2.18), line("L06", 60, 2.18)];
  const dir = voiceProject("fit", lines);
  const r = py([FIT, "--project", dir, "fit", join(dir, "ice", "audio", "voice", "lines.json")]);
  assert.equal(r.status, 1, r.stdout);
  const report = JSON.parse(readFileSync(join(dir, "ice", "audio", "voice", "fit.json"), "utf8"));
  assert.deepEqual(report.lines.map((l) => l.action), ["ok", "stretch", "exception", "rewrite", "exception", "rewrite"]);
  assert.match(report.problems.join("\n"), /L04: ratio 1\.200 needs a rewrite \(the take is too long for its slot/);
  assert.match(report.problems.join("\n"), /L06: ratio 1\.090 needs a rewrite/);
});

test("voice_fit fit: a provider take without its full record and an Arabic digit fail; a clean set passes", { skip: !PYTHON && "no Python 3.10+" }, () => {
  let dir = voiceProject("fit-record", [line("L01", 60, 2.2)], { ...VOICE, voice_id: "" });
  let r = py([FIT, "--project", dir, "fit", join(dir, "ice", "audio", "voice", "lines.json")]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /L01: provider take without its full record; missing voice_id/);
  dir = voiceProject("fit-digit", [line("L01", 60, 2.2, "100 عميل")]);
  r = py([FIT, "--project", dir, "fit", join(dir, "ice", "audio", "voice", "lines.json")]);
  assert.match(r.stdout, /L01: the spoken side has digits/);
  dir = voiceProject("fit-clean", [line("L01", 60, 2.2, "مية ألف عميل")]);
  r = py([FIT, "--project", dir, "fit", join(dir, "ice", "audio", "voice", "lines.json")]);
  assert.equal(r.status, 0, r.stdout);
});

test("voice_fit rows: every take gets the generated voice row the provenance gate accepts", { skip: !PYTHON && "no Python 3.10+" }, async () => {
  const dir = voiceProject("rows", [line("L01", 60, 2.2), line("L02", 60, 2.2)]);
  const r = py([FIT, "--project", dir, "rows", join(dir, "ice", "audio", "voice", "lines.json")]);
  assert.equal(r.status, 0, r.stderr);
  const manifest = JSON.parse(readFileSync(join(dir, "ice", "assets", "manifest.json"), "utf8"));
  assert.equal(manifest.assets.length, 2);
  const row = manifest.assets[0];
  assert.equal(row.role, "voice");
  assert.equal(row.source.type, "generated");
  for (const k of ["provider", "model", "voice_id", "date"]) assert.ok(row.source[k], k);
  assert.ok(row.rights.license_terms);
  const take = join(dir, "ice", "audio", "voice", "L01-t1.wav");
  assert.equal(row.sha256, hashOf(readFileSync(take)));
  writeFileSync(join(dir, "ice", "state.json"), JSON.stringify({ commercial_use: "no" }));
  writeFileSync(join(dir, "ice", "audio", "master.json"), JSON.stringify({ status: "pass",
    inputs: { vo: { path: "ice/audio/voice/L01-t1.wav", sha256: row.sha256 }, music: null, sfx: [], video_audio: false } }));
  const val = await import(pathToFileURL(abs("skills/ice-assets/scripts/validate-assets.mjs")).href);
  const res = val.validate({ project: dir, manifestPath: join(dir, "ice", "assets", "manifest.json"), statePath: join(dir, "ice", "state.json"),
    creditsPath: join(dir, "ice", "assets", "CREDITS.md"), scanDirs: [join(dir, "assets"), join(dir, "ice", "assets")], audioOnly: true });
  assert.equal(res.status, "PASS", res.problems.join("\n"));
});

test("voice_fit fit --apply writes a pitch-kept tempo copy and rows derive it from its take", { skip: (!PYTHON || !FFMPEG) && "no Python 3.10+ or ffmpeg" }, () => {
  const dir = voiceProject("apply", [line("L01", 60, 2.1)]);
  const lines = join(dir, "ice", "audio", "voice", "lines.json");
  let r = py([FIT, "--project", dir, "fit", lines, "--apply"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(existsSync(join(dir, "ice", "audio", "voice", "L01-t1-fit.wav")));
  r = py([FIT, "--project", dir, "rows", lines]);
  const fitted = JSON.parse(readFileSync(join(dir, "ice", "assets", "manifest.json"), "utf8")).assets.find((a) => a.id === "voice-L01-t1-fit");
  assert.equal(fitted.derived_from, "voice-L01-t1");
});

test("voice stage docs: two routes, access without credentials, never-list, no sound tags, the lines file and the fit bands", () => {
  const vd = readText("skills/ice-audio/references/voice-director.md");
  for (const s of ["## 1. Two routes, one stage (founder decision, 2026-11-01)", "**The user's recording.**", "**A voice provider the user has.**",
    "## 3. Access on any agent, never touching credentials", "never types a password or a key, never creates an account",
    "ElevenLabs `eleven_v4`", "`gemini-3.8-flash-tts`", "| Never | Hume", "## 4. The voice lines file: `ice/audio/voice/lines.json`",
    "Never a tag that makes a sound effect", "**Performance transfer.**", "0.92 to 1.08", "## 9. Source record and disclosure"]) {
    assert.ok(vd.includes(s), `voice-director.md: ${s}`);
  }
  const audio = readText("skills/ice-audio/SKILL.md");
  assert.match(audio, /`references\/voice-director\.md`, `scripts\/voice_fit\.py`/);
  assert.match(audio, /Music and sound effects are never made by code/);
  const q = readText("skills/ice-direction/references/questions.md");
  const voice = q.slice(q.indexOf("### Q-voice"), q.indexOf("### Q-music"));
  assert.match(voice, /2\. A voice I generate with your voice provider/);
  assert.match(voice, /A waived or skipped question never takes the provider option/);
  assert.match(voice, /without touching any key/);
  assert.match(readText("skills/ice-08-sound/SKILL.md"), /voice_fit\.py --project \. fit ice\/audio\/voice\/lines\.json --apply/);
  assert.match(readText("skills/ice-03-script/SKILL.md"), /spoken_numbers\.py check ice\/audio\/voice\/lines\.json/);
});

test("Arabic voice: the founder's words and Egyptian default, numbers as words, tashkeel by variety (founder pick 2026-11-01)", () => {
  const va = readText("skills/ice-arabic/references/voice-arabic.md");
  assert.ok(va.includes("اول فويس افضل فويس مصري"));
  assert.ok(va.includes("الارقام تتكتب عربي زي 100.000 تتكتب \"مية الف\""));
  assert.match(va, /`erFJevGCT0rMZPhBbaep`/);
  assert.match(va, /\| MSA \|[^\n]*Full and accurate on every word/);
  assert.match(va, /\| Egyptian \|[^\n]*Only on words the engine could read two ways and on loanwords/);
  assert.match(va, /was read as MSA "مائة ألف" in the middle of an Egyptian sentence/);
  assert.match(readText("skills/ice-arabic/SKILL.md"), /`references\/voice-arabic\.md`, `scripts\/spoken_numbers\.py`/);
});
