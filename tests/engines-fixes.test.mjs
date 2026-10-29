// render-html.mjs fixes from the 04 demo pilot: a file the page asks for outside the served folder fails within
// seconds with its path and the --root fix (it used to hang for 300 s), the default served folder is the project
// folder that holds ice/, and one frame rendered after two different seek histories is byte-identical (software
// compositing by default). Needs a local Chrome, Chromium or Edge (or ICE_CHROME); skips cleanly without one.
// Stills only, so FFmpeg is not needed.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { abs } from "./helpers.mjs";

const RENDER = abs("skills/ice-engines/scripts/render-html.mjs");
const work = mkdtempSync(join(tmpdir(), "ice engines fixes "));
after(() => rmSync(work, { recursive: true, force: true }));

const render = (cwd, ...args) => {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [RENDER, ...args], { cwd, encoding: "utf8", timeout: 180000, env: { ...process.env, ICE_DRIVER: process.env.ICE_DRIVER || "cdp" } });
  return { ...r, seconds: (Date.now() - t0) / 1000, all: (r.stdout || "") + (r.stderr || "") };
};

function writePage(file, html) {
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, html);
}

// Preflight: a trivial page must render one still, or the browser is not usable here and every test skips.
let browserSkip = false;
{
  const dir = join(work, "preflight");
  writePage(join(dir, "index.html"), `<!doctype html><html><body style="margin:0;background:#234"><script>
window.DEMO = { width: 64, height: 36, fps: 10, duration: 1 }; window.renderAt = async () => {}; window.__ready = true;
</script></body></html>`);
  const r = render(dir, join(dir, "index.html"), "--stills", "0");
  if (r.status !== 0) browserSkip = "no usable Chrome, Chromium or Edge here (set ICE_CHROME): " + r.all.trim().split("\n").slice(-1)[0];
}

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#2a7"/>
<path d="M22 36c20-6 40-4 56 6M26 52c16-4 32-3 46 5" stroke="#000" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`;

// A page in film/ that loads its logo from the sibling assets/ folder (the layout of the ice-assets skill).
function siblingProject(name, withIce) {
  const proj = join(work, name);
  writePage(join(proj, "assets", "brand", "logo.svg"), LOGO);
  if (withIce) mkdirSync(join(proj, "ice"), { recursive: true });
  writePage(join(proj, "film", "index.html"), `<!doctype html><html><body style="margin:0;background:#111">
<img id="logo" src="../assets/brand/logo.svg" width="40" height="40"><script>
window.DEMO = { width: 64, height: 36, fps: 10, duration: 1 };
window.renderAt = async (t) => { document.getElementById("logo").style.transform = "translateX(" + (10 * t) + "px)"; };
document.getElementById("logo").onload = () => { window.__ready = true; };
</script></body></html>`);
  return proj;
}

test("render-html: a file outside the served folder fails within seconds, naming the file and the --root fix", { skip: browserSkip }, () => {
  const proj = siblingProject("no ice project", false);
  const r = render(proj, join(proj, "film", "index.html"), "--stills", "0.5");
  assert.notEqual(r.status, 0, r.all);
  assert.ok(r.seconds < 60, `took ${r.seconds} s; it must fail fast, not wait for the ready timeout`);
  assert.match(r.all, /\/assets\/brand\/logo\.svg/, r.all);
  assert.match(r.all, /not inside the served folder/, r.all);
  assert.ok(r.all.includes(`--root "${proj}"`), "the fix names the project folder:\n" + r.all);

  const withIce = siblingProject("explicit root project", true);
  const r2 = render(withIce, join(withIce, "film", "index.html"), "--root", join(withIce, "film"), "--stills", "0.5");
  assert.notEqual(r2.status, 0, "an explicit --root is served alone:\n" + r2.all);
  assert.ok(r2.seconds < 60, `took ${r2.seconds} s`);
  assert.match(r2.all, /\/assets\/brand\/logo\.svg/, r2.all);
});

test("render-html: the default served folder is the project folder that holds ice/", { skip: browserSkip }, () => {
  const proj = siblingProject("ice project", true);
  const r = render(proj, join(proj, "film", "index.html"), "--stills", "0.5");
  assert.equal(r.status, 0, r.all);
  assert.match(r.all, /serving .*ice project \(the project folder/, r.all);
  assert.ok(existsSync(join(proj, "film", "out", "stills", "t000.50.png")), "still not written");
});

test("render-html: one frame after two different seek histories is byte-identical (software compositing default)", { skip: browserSkip }, () => {
  const proj = join(work, "determinism project");
  mkdirSync(join(proj, "ice"), { recursive: true });
  writePage(join(proj, "film", "logo.svg"), LOGO);
  // A 2.5D CSS scene: perspective camera, preserve-3d planes, and a promoted (will-change) image that scales: the
  // case where GPU compositing kept layers between seeks in the 04 demo.
  writePage(join(proj, "film", "index.html"), `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#101418;overflow:hidden}
#stage{position:absolute;left:0;top:0;width:320px;height:180px;perspective:500px;overflow:hidden}
#cam{position:absolute;inset:0;transform-style:preserve-3d}
.p{position:absolute;left:90px;top:40px;width:140px;height:100px;border-radius:10px;color:#fff;font:700 18px/1.1 sans-serif;
display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2a7,#064)}
#logo{position:absolute;left:140px;top:70px;width:40px;height:40px;will-change:transform}
</style></head><body><div id="stage"><div id="cam"><div class="p" id="a">Plane A</div><div class="p" id="b">Plane B</div></div>
<img id="logo" src="logo.svg"></div><script>
window.DEMO = { width: 320, height: 180, fps: 30, duration: 4 };
const $ = (id) => document.getElementById(id);
window.renderAt = async (t) => {
  const k = t / 4;
  $("cam").style.transform = "translateZ(" + (-150 + 220 * k) + "px) rotateY(" + (-25 + 50 * k) + "deg) rotateX(" + (8 - 16 * k) + "deg)";
  $("a").style.transform = "translate3d(" + (-80 + 20 * k) + "px,-10px,-90px) rotateY(" + (30 - 60 * k) + "deg) scale(" + (0.4 + 1.4 * k) + ")";
  $("b").style.transform = "translate3d(" + (80 - 20 * k) + "px,15px,-40px) rotateY(" + (-30 + 60 * k) + "deg) scale(" + (1.6 - 1.2 * k) + ")";
  $("logo").style.transform = "scale(" + (0.25 + 2.5 * k) + ") rotate(" + (20 * k) + "deg)";
};
$("logo").decode().then(() => window.renderAt(0)).then(() => { window.__ready = true; });
</script></body></html>`);
  const page = join(proj, "film", "index.html");
  const still = join(proj, "film", "out", "stills", "t003.00.png");

  const fresh = render(proj, page, "--stills", "3");
  assert.equal(fresh.status, 0, fresh.all);
  assert.match(fresh.all, /software compositing/, "software compositing must be the default:\n" + fresh.all);
  const a = readFileSync(still);
  rmSync(still);

  const history = render(proj, page, "--stills", "3.9,0.2,2,1,0.5,3.5,0,2.7,3");
  assert.equal(history.status, 0, history.all);
  const b = readFileSync(still);
  assert.ok(a.length > 1000, "still is empty");
  assert.ok(a.equals(b), "the frame at 3 s differs between a fresh render and a render after a seek history");
});

// ---------------------------------------------------------------- lessons 1, 2, 3, 7 and 8 (owner decision, 2026-10-29)
// Free tools, models and packages are installed without a question and recorded; free downloads and a fetchable
// reference link are not stage 01 questions; the identity and music questions follow the new rules; disk space is
// checked and rebuildable intermediates are cleaned up. Text checks only: no browser needed.
const readRepo = (f) => readFileSync(abs(f), "utf8");
const subsection = (text, heading) => {
  const start = text.indexOf(heading);
  assert.ok(start >= 0, `"${heading}" not found`);
  const end = text.slice(start + heading.length).search(/\n#{2,3} /);
  return end < 0 ? text.slice(start) : text.slice(start, start + heading.length + end);
};
const bankEntry = (slot) => subsection(readRepo("skills/ice-direction/references/questions.md"), `### Q-${slot}:`);
const slotRow = (slot) => readRepo("skills/ice-direction/references/questions.md").split(/\r?\n/).find((l) => l.includes(`| \`${slot}\` |`)) ?? "";
const ROUTER_MD = "skills/ice-motion-director/SKILL.md";

test("free tools and models install without a question and are recorded", () => {
  const engine = readRepo("skills/ice-engines/references/engine-choice.md");
  const installs = subsection(engine, "### 7.6 Installs without a question");
  assert.match(installs, /Owner decision, 2026-10-29/);
  for (const pin of ["`pip.faster-whisper`", "`pip.demucs`", "`models.whisper`", "`pip.yt-dlp`"]) assert.ok(installs.includes(pin), `names ${pin}`);
  assert.match(installs, /Record each install in `ice\/DIRECTION\.md` \(what, exact version, size on disk, folder/);
  assert.match(installs, /delivery note/);
  assert.match(installs, /never `@latest`, never an unpinned `npx`, never a runtime download of skills or instructions/);
  assert.match(installs, /a paid service, anything that needs an account, a sign-in or a key the user has not set, and any spending/);
  assert.match(installs, /administrator password is the plain step of 7\.3, not a question/);
  const versions = JSON.parse(readRepo("skills/ice-engines/references/versions.json"));
  for (const name of ["faster-whisper", "demucs", "yt-dlp"]) assert.match(versions.pip[name]?.version ?? "", /^\d+(\.\d+)+$/, `versions.json pins ${name}`);
  assert.doesNotMatch(JSON.stringify(versions), /after the user agrees|the user approves/);

  const old = /Never install anything without the user's yes|never install anything without their consent|Auto mode never installs software|Ask the user to install or approve each prerequisite|run only after the user agrees|wait for their consent/i;
  for (const f of [ROUTER_MD, "skills/ice-direction/references/questions.md", "skills/ice-engines/SKILL.md", "skills/ice-engines/references/engine-choice.md",
    "skills/ice-motion-director/references/step-mode.md", "skills/ice-motion-director/references/prerequisites.md"]) assert.doesNotMatch(readRepo(f), old, f);
  const router = readRepo(ROUTER_MD);
  const paragraph = router.slice(router.indexOf("In auto mode the final render needs no further approval."), router.indexOf("## 6. "));
  assert.match(paragraph, /Auto mode never signs in, spends money or publishes on its own\./);
  assert.match(paragraph, /installs free pinned tools and models without asking, each recorded \(`ice-engines\/references\/engine-choice\.md` section 7\.6\)/);
  assert.match(bankEntry("tools"), /paid, needs an account or a sign-in, or has no install route on this machine/);
  assert.match(slotRow("tools"), /installed without a question \(`ice-engines\/references\/engine-choice\.md` section 7\.6\)/);
});

test("free media downloads and a fetchable reference link are not stage 01 questions", () => {
  const router = readRepo(ROUTER_MD);
  const stopA = router.split(/\r?\n/).find((l) => l.startsWith("| Auto | A.")) ?? "";
  assert.match(stopA, /never a free download or install/);
  assert.doesNotMatch(stopA, /the download list|any install step/);
  assert.match(router, /downloads free media from the routes of `ice-assets\/references\/sourcing-and-licenses\.md` sections 4 and 5/);
  assert.match(router, /`ICE_OFFLINE=1` or the user's `sources\.json` turns this down/);
  assert.match(slotRow("reference_file"), /Only when a linked reference cannot be fetched/);
  const ref = bankEntry("reference-file");
  assert.match(ref, /downloaded by default, with no question, so it can be measured/);
  assert.doesNotMatch(ref, /only on the user's yes|never as a default/);
  assert.doesNotMatch(readRepo("skills/ice-motion-director/references/routes.md"), /downloaded only with the user's yes/);
  assert.doesNotMatch(readRepo("skills/ice-motion-director/references/harness.md"), /ask before any network or install step|Ask before installs or network calls/i);
});

test("Q-identity compares the content type with the reference type", () => {
  const identity = bankEntry("identity");
  assert.match(identity, /compare the content type of the user's video with the reference's content type/);
  assert.match(identity, /`ice-remake\/references\/rights-and-modes\.md` section 1, "The identity fits the content"/);
  assert.match(identity, /When they differ, option 1 below is recommended, and in auto mode, with a waiver or with no answer, it is the decision taken/);
  assert.match(identity, /^1\. \(Recommended\) The same editing principles with an identity that fits your content/m);
  assert.match(slotRow("identity"), /compares the content type with the reference's type/);
});

test("Q-music offers real library tracks heard on the film and no music made by code", () => {
  const music = bankEntry("music");
  assert.match(music, /`ice-audio\/SKILL\.md` section 5, "The options flow"/);
  assert.match(music, /2 to 3 real library tracks ranked by measurement against the reference, or against the film type/);
  assert.match(music, /Music made by code is never an option unless the user asked for it in their own words/);
  const options = music.split(/\r?\n/).filter((l) => /^\d\. /.test(l));
  assert.equal(options.length, 4);
  for (const o of options) assert.doesNotMatch(o, /\bcode\b|generated|synth/i, `an option offers made music: ${o}`);
  assert.match(options[3], /Your own track/);
  assert.doesNotMatch(music, /made by code or licensed/);
  const stopB = readRepo(ROUTER_MD).split(/\r?\n/).find((l) => l.startsWith("| Auto | B.")) ?? "";
  assert.match(stopB, /2 to 3 music options laid on the film \(`ice-audio\/SKILL\.md` section 5\)/);
});

test("disk space is checked with a threshold and rebuildable intermediates are deleted after approval", () => {
  const disk = subsection(readRepo("skills/ice-engines/references/engine-choice.md"), "### 7.7 Disk space");
  assert.match(disk, /`need` is the estimate plus 5 GB/);
  assert.match(disk, /ice-state\.mjs space --need <need in GB>/);
  for (const v of ["`HF_HOME`", "`TORCH_HOME`", "`PIP_CACHE_DIR`", "`npm_config_cache`", "`PLAYWRIGHT_BROWSERS_PATH`", "`TMPDIR`"]) assert.ok(disk.includes(v), `names ${v}`);
  assert.match(disk, /never in a shell profile or a system setting/);
  const cleanup = subsection(readRepo("skills/ice-engines/references/render-export.md"), "## 9. Heavy intermediates");
  assert.match(cleanup, /deleted once the stage that consumes them is approved/);
  assert.match(cleanup, /Never deleted: the user's files and supplied sources/);
  assert.match(cleanup, /Log each deletion in `ice\/DIRECTION\.md`/);
  assert.match(readRepo("skills/ice-engines/SKILL.md"), /`references\/render-export\.md` section 9/);
});
