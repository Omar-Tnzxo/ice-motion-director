// ice-audio sound_map.py: a synthetic reference (a steady 120 BPM beat bed with a pad, one impact, one whoosh sweep,
// one riser into a hit, and a quiet tail) is written to a temp folder with numpy, mapped, and checked: the JSON schema
// is exact, every placed effect is found near its time with the right type, and the tail stays empty. A second
// fixture rebuilds the arc of a finished music-led ad with no voice (street-noise intro with horns and a jackhammer,
// staged build, a fill, a breath with a riser, the drop, a quiet ending into a final hit and its ring-out): no voice is
// reported, the drop is placed within 0.5 s, and the ending is an outro. A third fixture is a sung melody (held notes
// with vibrato, moving vowels) over a soft beat: it must read as music with sung vocals, not as speech. A fourth
// fixture is speech-like babble over a beat: running through the whole track it reads as probably sung, never a bare
// voice-over; with pauses between lines it stays spoken.
// Skips cleanly when Python 3, numpy plus scipy, or ffmpeg is missing.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { abs, findPython, hasCommand } from "./helpers.mjs";

const PYTHON = findPython();
const FFMPEG = hasCommand("ffmpeg");
const SCRIPT = abs("skills/ice-audio/scripts/sound_map.py");
const hasDeps = PYTHON && spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", "import numpy, scipy"], { stdio: "ignore" }).status === 0;
const skip = !PYTHON ? "Python 3 not found" : !hasDeps ? "numpy or scipy not installed" : !FFMPEG ? "ffmpeg not on PATH" : false;

const tmp = mkdtempSync(join(tmpdir(), "ice-sound-map-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

// Event times in seconds, as placed by the fixture below.
const IMPACT = 5.37, WHOOSH = 8.1, RISER = 11.0, HIT = 14.0, TAIL = 16.0;

const FIXTURE = String.raw`
import sys, wave
import numpy as np

sr = 44100
n = int(sr * 20.0)
t = np.arange(n) / sr
x = np.zeros(n)
rng = np.random.default_rng(7)


def add(sig, at):
    i = int(round(at * sr))
    m = min(len(sig), n - i)
    x[i:i + m] += sig[:m]


def sweep_noise(d, f0, f1):
    m = int(d * sr)
    out = np.zeros(m + 2048)
    w = np.hanning(2048)
    fr = np.fft.rfftfreq(2048, 1 / sr)
    for s in range(0, m, 512):
        fc = f0 * (f1 / f0) ** (s / m)
        S = np.fft.rfft(rng.standard_normal(2048) * w)
        S *= np.exp(-0.5 * (np.log2(np.maximum(fr, 1) / fc) / 0.5) ** 2)
        out[s:s + 2048] += np.fft.irfft(S) * w
    out = out[:m]
    return out / (np.max(np.abs(out)) + 1e-9)


kt = np.arange(int(0.18 * sr)) / sr
kick = 0.6 * np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-kt * 30)) / sr) * np.exp(-kt * 18)
hn = np.diff(rng.standard_normal(int(0.03 * sr)), prepend=0.0)
hat = 0.08 * hn * np.exp(-np.arange(len(hn)) / sr * 120)
for b in range(int(${TAIL} * 2)):
    add(kick, b * 0.5)
    add(hat, b * 0.5 + 0.25)
x += sum(np.sin(2 * np.pi * f * t) for f in (220.0, 261.63, 329.63)) * 0.03 * np.where(t < ${TAIL}, 1.0, 0.25)
it = np.arange(int(0.6 * sr)) / sr
impact = 0.5 * rng.standard_normal(len(it)) * np.exp(-it / 0.06) + 0.5 * np.sin(2 * np.pi * 55 * it) * np.exp(-it / 0.15)
add(impact, ${IMPACT})
u = np.arange(int(0.8 * sr)) / int(0.8 * sr)
add(0.5 * sweep_noise(0.8, 400, 5000) * np.sin(np.pi * u) ** 2, ${WHOOSH})
u = np.arange(int(3.0 * sr)) / int(3.0 * sr)
amp = 0.5 * 10 ** (-34 * (1 - u) / 20)
add(amp * sweep_noise(3.0, 300, 6000) + 0.3 * amp * np.sin(2 * np.pi * np.cumsum(200 * 4 ** u) / sr), ${RISER})
add(impact, ${HIT})
x = x / np.max(np.abs(x)) * 0.9
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((x * 32767).astype("<i2").tobytes())
`;

const keys = (o) => Object.keys(o).sort();
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

test("sound_map: schema, effect times and types on a synthetic reference", { skip }, () => {
  const wav = join(tmp, "reference.wav");
  const out = join(tmp, "map");
  writeFileSync(join(tmp, "fixture.py"), FIXTURE);
  const mk = spawnSync(PYTHON[0], [...PYTHON.slice(1), join(tmp, "fixture.py"), wav], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), SCRIPT, wav, "--out", out], { encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  for (const f of ["sound_map.json", "SOUND-MAP.md", "sound-map.svg"]) assert.ok(existsSync(join(out, f)), `${f} is written`);
  const m = JSON.parse(readFileSync(join(out, "sound_map.json"), "utf8"));

  // Exact schema: the style recipe reads this file unchanged.
  assert.deepEqual(keys(m), ["duration_s", "mix", "music", "notes", "sfx", "version", "voice"]);
  assert.equal(m.version, 1);
  assert.ok(Math.abs(m.duration_s - 20) < 0.05, `duration ${m.duration_s}`);
  assert.deepEqual(keys(m.music), ["energy_curve", "genre_guess", "instrumentation_guess", "key", "mode", "present", "sections", "tempo_bpm", "tempo_confidence"]);
  assert.equal(typeof m.music.present, "boolean");
  for (const k of ["tempo_bpm", "tempo_confidence"]) assert.ok(isNum(m.music[k]), k);
  for (const k of ["key", "mode"]) assert.equal(typeof m.music[k], "string", k);
  for (const s of m.music.sections) { assert.deepEqual(keys(s), ["end", "energy", "label", "start"]); assert.ok(isNum(s.start) && isNum(s.end) && isNum(s.energy) && typeof s.label === "string"); }
  for (const c of m.music.energy_curve) { assert.deepEqual(keys(c), ["brightness", "rms_db", "t"]); assert.ok(isNum(c.t) && isNum(c.rms_db) && isNum(c.brightness)); }
  for (const g of [...m.music.instrumentation_guess, ...m.music.genre_guess]) { assert.deepEqual(keys(g), ["confidence", "name"]); assert.ok(isNum(g.confidence) && typeof g.name === "string"); }
  const TYPES = ["impact", "whoosh", "riser", "downer", "click", "swell", "stinger", "other"];
  for (const e of m.sfx) {
    assert.deepEqual(keys(e), ["confidence", "dur", "peak_db", "t", "type"]);
    assert.ok(isNum(e.t) && isNum(e.dur) && isNum(e.confidence) && isNum(e.peak_db) && TYPES.includes(e.type), JSON.stringify(e));
  }
  assert.deepEqual(keys(m.voice), ["present", "segments"]);
  for (const s of m.voice.segments) assert.deepEqual(keys(s), ["end", "start"]);
  assert.deepEqual(keys(m.mix), ["integrated_lufs", "lra", "true_peak_dbtp"]);
  for (const k of keys(m.mix)) assert.ok(isNum(m.mix[k]), k);
  assert.ok(Array.isArray(m.notes) && m.notes.every((n) => typeof n === "string"));

  // Music: the 120 BPM bed is found, sections tile the whole file.
  assert.equal(m.music.present, true);
  assert.ok(Math.abs(m.music.tempo_bpm - 120) <= 2 && m.music.tempo_confidence >= 0.5, `tempo ${m.music.tempo_bpm} (${m.music.tempo_confidence})`);
  assert.equal(m.music.sections[0].start, 0);
  assert.ok(Math.abs(m.music.sections.at(-1).end - m.duration_s) < 0.05);
  m.music.sections.slice(1).forEach((s, i) => assert.ok(Math.abs(s.start - m.music.sections[i].end) < 1e-6, "sections are contiguous"));
  assert.equal(m.voice.present, false, "no speech in the fixture");

  // Effects: each placed event is found near its time with its type. Tolerances: sharp onsets 60 ms, the whoosh
  // 250 ms (its envelope fades in from silence), the riser's start anywhere in its first 60 percent and its end within 300 ms of the hit.
  const sfx = JSON.stringify(m.sfx);
  const find = (type, ok) => m.sfx.find((e) => e.type === type && ok(e));
  assert.ok(find("impact", (e) => Math.abs(e.t - IMPACT) <= 0.06), `impact near ${IMPACT}: ${sfx}`);
  assert.ok(find("whoosh", (e) => Math.abs(e.t - WHOOSH) <= 0.25 && e.dur >= 0.3 && e.dur <= 1.2), `whoosh near ${WHOOSH}: ${sfx}`);
  assert.ok(find("riser", (e) => e.t >= RISER - 0.2 && e.t <= RISER + 1.8 && Math.abs(e.t + e.dur - HIT) <= 0.3), `riser into ${HIT}: ${sfx}`);
  assert.ok(find("impact", (e) => Math.abs(e.t - HIT) <= 0.06), `hit near ${HIT}: ${sfx}`);
  assert.ok(m.sfx.length <= 6, `at most two extra events: ${sfx}`);
  assert.ok(m.sfx.every((e) => e.t < TAIL + 0.4), `nothing in the quiet tail: ${sfx}`);
  for (const e of m.sfx.filter((x) => x.type !== "other")) assert.ok(e.confidence >= 0.5, `confident ${e.type}: ${e.confidence}`);
});

// Ground truth: drop at 19.5 s, ending from 31.5 s into the final hit at 33.5 s, no voice.
const ARC_DROP = 19.5, ARC_ENDING = 31.5, ARC_HIT = 33.5;
const ARC = String.raw`import sys, wave
import numpy as np

sr = 22050
dur = 35.0
n = int(sr * dur)
t = np.arange(n) / sr
x = np.zeros(n)
rng = np.random.default_rng(11)


def add(sig, at, gain=1.0):
    i = int(round(at * sr))
    m = min(len(sig), n - i)
    if m > 0:
        x[i:i + m] += gain * sig[:m]


def env(d, tau):
    u = np.arange(int(d * sr)) / sr
    return u, np.exp(-u / tau)


u, e = env(0.18, 0.055)
kick = np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-u * 30)) / sr) * e
u, e = env(0.03, 0.008)
hat = np.diff(rng.standard_normal(len(u)), prepend=0.0) * e
u, e = env(0.15, 0.04)
snare = (rng.standard_normal(len(u)) * 0.7 + np.sin(2 * np.pi * 190 * u) * 0.5) * e
u, e = env(0.45, 0.2)
bass = np.sin(2 * np.pi * 55 * u) * e
u, e = env(0.3, 0.12)
stab = sum(np.sign(np.sin(2 * np.pi * f * u)) for f in (220.0, 277.18, 329.63)) / 3 * e

# 0 to 7.5 s: street noise: a filtered noise bed, steady-pitch horn blasts, jackhammer bursts.
street = np.convolve(rng.standard_normal(int(7.5 * sr)), np.ones(8) / 8, mode="same") * 0.05
add(street, 0.0)
for at, f, d in ((0.8, 392.0, 0.6), (2.6, 440.0, 0.4), (3.1, 440.0, 0.5), (5.4, 349.0, 0.7)):
    u = np.arange(int(d * sr)) / sr
    add(sum(np.sin(2 * np.pi * f * h * u) / h for h in range(1, 7)) * np.minimum(1, u / 0.02) * np.minimum(1, (d - u) / 0.05), at, 0.15)
for at in (1.6, 4.2, 6.2):
    for k in range(int(1.2 * 18)):
        u, e = env(0.03, 0.01)
        add(rng.standard_normal(len(u)) * e, at + k / 18, 0.12)

# 7.5 to 15.5 s: the play press, then instruments join one by one.
beat = 0.5
for b in range(16):
    at = 7.5 + b * beat
    add(kick, at, 0.45)
    if at >= 9.5:
        add(hat, at + 0.25, 0.08)
    if at >= 11.5:
        add(bass, at, 0.25)
    if at >= 13.5 and b % 2 == 0:
        add(stab, at, 0.12)
# 15.5 to 17.5 s: a fill, sixteenth-note snares getting louder.
for k in range(16):
    add(snare, 15.5 + k * 0.125, 0.15 + 0.02 * k)
add(kick, 15.5, 0.45)
# 17.5 to 19.5 s: a breath with a riser.
u = np.arange(int(2.0 * sr)) / sr
add(np.sin(2 * np.pi * 220 * u) * 0.04 + rng.standard_normal(len(u)) * 0.05 * (u / 2.0) ** 2, 17.5)
# 19.5 to 31.5 s: the drop at full groove.
for b in range(24):
    at = 19.5 + b * beat
    add(kick, at, 0.6)
    add(hat, at + 0.25, 0.12)
    add(bass, at, 0.35)
    if b % 2 == 1:
        add(snare, at, 0.3)
    add(stab, at, 0.15)
# 31.5 to 33.5 s: the ending builds quietly into the final hit.
u = np.arange(int(2.0 * sr)) / sr
add(np.sin(2 * np.pi * 220 * u) * 0.04 + rng.standard_normal(len(u)) * 0.06 * (u / 2.0) ** 2, 31.5)
# 33.5 s: the final hit, then a ring-out to 35 s.
u, e = env(1.5, 0.35)
hit = np.zeros(len(u))
hit[:len(kick)] += 0.8 * kick
hit += sum(np.sin(2 * np.pi * f * u) for f in (110.0, 220.0, 277.18, 329.63)) * 0.12 * e + rng.standard_normal(len(u)) * 0.3 * np.exp(-u / 0.05)
add(hit, 33.5)
x = x / np.max(np.abs(x)) * 0.9
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((x * 32767).astype("<i2").tobytes())
`;

test("sound_map: a music-led arc with street noise and no voice: no voice, the drop on time, an outro", { skip }, () => {
  const wav = join(tmp, "arc.wav");
  const out = join(tmp, "arc-map");
  writeFileSync(join(tmp, "arc.py"), ARC);
  const mk = spawnSync(PYTHON[0], [...PYTHON.slice(1), join(tmp, "arc.py"), wav], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), SCRIPT, wav, "--out", out], { encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  const m = JSON.parse(readFileSync(join(out, "sound_map.json"), "utf8"));
  const secs = JSON.stringify(m.music.sections);
  assert.equal(m.voice.present, false, `horns and a jackhammer are not a voice: ${JSON.stringify(m.voice)}`);
  assert.deepEqual(m.voice.segments, []);
  assert.ok(m.music.sections.some((s) => s.label === "drop" && Math.abs(s.start - ARC_DROP) <= 0.5), `drop within 0.5 s of ${ARC_DROP}: ${secs}`);
  const last = m.music.sections.at(-1);
  assert.equal(last.label, "outro", `the final hit and its ring-out end the piece: ${secs}`);
  assert.ok(last.start >= ARC_ENDING - 1 && last.start <= ARC_HIT + 0.1, `outro starts between the ending and the hit: ${secs}`);
  assert.ok(m.music.genre_guess.length > 0, "a steady groove gets genre proposals");
});

const SUNG = String.raw`import sys, wave
import numpy as np

sr = 22050
n = int(sr * 16.0)
x = np.zeros(n)
rng = np.random.default_rng(5)


def add(sig, at, gain=1.0):
    i = int(round(at * sr))
    m = min(len(sig), n - i)
    if m > 0:
        x[i:i + m] += gain * sig[:m]


# A soft beat at 120 BPM: kick on every beat, a closed hat on the offbeats, a low bass note per bar.
u = np.arange(int(0.18 * sr)) / sr
kick = np.sin(2 * np.pi * np.cumsum(50 + 60 * np.exp(-u * 30)) / sr) * np.exp(-u / 0.06)
u = np.arange(int(0.03 * sr)) / sr
hat = np.diff(rng.standard_normal(len(u)), prepend=0.0) * np.exp(-u / 0.008)
u = np.arange(int(2.0 * sr)) / sr
bass = np.sin(2 * np.pi * 55 * u) * np.exp(-u / 1.2)
for b in range(32):
    add(kick, b * 0.5, 0.35)
    add(hat, b * 0.5 + 0.25, 0.05)
    if b % 4 == 0:
        add(bass, b * 0.5, 0.15)

# A sung melody: notes on a scale, held for one or two eighths, legato, 5.5 Hz vibrato, three vowel formant sets,
# phrases of two bars with a breath between them.
scale = [0, 2, 3, 5, 7, 8, 10, 12]
vowels = [(700, 1200, 2600), (400, 2000, 2700), (450, 800, 2500)]
fr = np.fft.rfftfreq(2048, 1 / sr)
t0 = 0.5
for phrase in range(7):
    at = t0 + phrase * 2.0
    beats = 0.0
    while beats < 1.5:
        d = 0.25 * rng.choice([1, 2])
        f0 = 196.0 * 2 ** (scale[rng.integers(len(scale))] / 12)
        u = np.arange(int(d * sr)) / sr
        f = f0 * 2 ** (0.25 * np.sin(2 * np.pi * 5.5 * u) / 12)
        ph = 2 * np.pi * np.cumsum(f) / sr
        F = vowels[rng.integers(3)]
        tone = sum(np.sin(h * ph) * sum(np.exp(-0.5 * ((h * f0 - fm) / 120) ** 2) for fm in F) / h ** 0.5 for h in range(1, 25) if h * f0 < 5000)
        envl = np.minimum(1, u / 0.03) * np.minimum(1, (d - u) / 0.04)
        add(tone * envl, at + beats, 0.25)
        beats += d
x = x / np.max(np.abs(x)) * 0.9
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((x * 32767).astype("<i2").tobytes())
`;

test("sound_map: a sung melody over a soft beat reads as music with sung vocals, not as speech", { skip }, () => {
  const wav = join(tmp, "sung.wav");
  const out = join(tmp, "sung-map");
  writeFileSync(join(tmp, "sung.py"), SUNG);
  const mk = spawnSync(PYTHON[0], [...PYTHON.slice(1), join(tmp, "sung.py"), wav], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), SCRIPT, wav, "--out", out], { encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  const m = JSON.parse(readFileSync(join(out, "sound_map.json"), "utf8"));
  assert.equal(m.music.present, true, "a beat and a sung line are music");
  assert.equal(m.voice.present, false, `a sung line is not a voice-over: ${JSON.stringify(m.voice)}`);
  const sungGuess = m.music.instrumentation_guess.find((g) => g.name === "sung vocals");
  assert.ok(sungGuess && sungGuess.confidence >= 0.5, `sung vocals proposed: ${JSON.stringify(m.music.instrumentation_guess)}`);
  assert.ok(m.notes.some((n) => /^Sung vocals/.test(n)), "the sung segments are written in notes");
});

const BABBLE = String.raw`import sys, wave
import numpy as np

# argv: output wav, "continuous" or "phrased"
sr = 22050
n = int(sr * 16.0)
x = np.zeros(n)
rng = np.random.default_rng(3)


def add(sig, at, gain=1.0):
    i = int(round(at * sr))
    m = min(len(sig), n - i)
    if m > 0:
        x[i:i + m] += gain * sig[:m]


# A soft beat at 120 BPM with a held bass, as under a promo.
u = np.arange(int(0.18 * sr)) / sr
kick = np.sin(2 * np.pi * np.cumsum(50 + 60 * np.exp(-u * 30)) / sr) * np.exp(-u / 0.06)
u = np.arange(int(2.0 * sr)) / sr
bass = np.sin(2 * np.pi * 55 * u) * np.exp(-u / 1.5)
for b in range(32):
    add(kick, b * 0.5, 0.3)
    if b % 4 == 0:
        add(bass, b * 0.5, 0.12)

# Speech-like babble: syllables of random length off the beat grid, a gliding intonation contour, a new vowel
# per syllable, a short noise consonant before each; "phrased" leaves a pause after every two seconds of talk.
vowels = [(700, 1200, 2600), (400, 2000, 2700), (450, 800, 2500), (300, 2300, 3000)]
spans = [(0.4, 15.6)] if sys.argv[2] == "continuous" else [(0.4, 2.4), (4.4, 6.4), (8.4, 10.4), (12.4, 14.4)]
for a, b in spans:
    t = a
    while t < b - 0.25:
        d = rng.uniform(0.12, 0.3)
        u = np.arange(int(d * sr)) / sr
        f = 120 + 40 * np.sin(2 * np.pi * 0.7 * (t + u)) + rng.uniform(-15, 15) * (u / d)
        ph = 2 * np.pi * np.cumsum(f) / sr
        F = vowels[rng.integers(len(vowels))]
        tone = sum(np.sin(h * ph) * sum(np.exp(-0.5 * ((h * 130 - fm) / 150) ** 2) for fm in F) / h ** 0.5 for h in range(1, 30))
        envl = np.sin(np.pi * u / d) ** 0.7
        add(rng.standard_normal(int(0.03 * sr)) * 0.05, t)
        add(tone * envl, t + 0.03, 0.12)
        t += d + 0.03 + rng.uniform(0.0, 0.06)
x = x / np.max(np.abs(x)) * 0.9
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((x * 32767).astype("<i2").tobytes())
`;

test("sound_map: a vocal running through the music reads as probably sung; a phrased one stays spoken", { skip }, () => {
  const map = (kind) => {
    const wav = join(tmp, `babble-${kind}.wav`);
    const out = join(tmp, `babble-${kind}-map`);
    writeFileSync(join(tmp, "babble.py"), BABBLE);
    const mk = spawnSync(PYTHON[0], [...PYTHON.slice(1), join(tmp, "babble.py"), wav, kind], { encoding: "utf8" });
    assert.equal(mk.status, 0, mk.stderr);
    const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), SCRIPT, wav, "--out", out], { encoding: "utf8", timeout: 120000 });
    assert.equal(r.status, 0, r.stderr);
    return { m: JSON.parse(readFileSync(join(out, "sound_map.json"), "utf8")), md: readFileSync(join(out, "SOUND-MAP.md"), "utf8"), stdout: r.stdout };
  };
  const sungOf = (m) => m.music.instrumentation_guess.find((g) => g.name === "sung vocals");

  const run = map("continuous");
  assert.equal(run.m.music.present, true);
  assert.ok(sungOf(run.m) && sungOf(run.m).confidence >= 0.5, `probably sung: ${JSON.stringify(run.m.music.instrumentation_guess)}`);
  assert.ok(run.m.notes.some((n) => /^Vocal probably sung \(confidence 0\.\d\d\)/.test(n)), "the rule is written in notes with its confidence");
  assert.match(run.stdout, /voice probably sung \(0\.\d\d\)/, "the summary never says a bare voice yes");
  assert.match(run.md, /Probably sung, not a voice-over/);
  assert.ok(!run.m.music.instrumentation_guess.some((g) => g.name === "spoken voice over the music"));

  const phrased = map("phrased");
  assert.equal(phrased.m.voice.present, true, "a voice-over with pauses is still a voice");
  assert.equal(sungOf(phrased.m), undefined, `a phrased voice is not called sung: ${JSON.stringify(phrased.m.music.instrumentation_guess)}`);
  assert.match(phrased.stdout, /voice spoken/);
});

test("sound_map: a file with no audio stream exits 2 with a clear message", { skip }, () => {
  const mp4 = join(tmp, "silent-picture.mp4");
  const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=160x90:rate=10:duration=1", "-pix_fmt", "yuv420p", mp4], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), SCRIPT, mp4, "--out", join(tmp, "none")], { encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no audio stream/);
});
