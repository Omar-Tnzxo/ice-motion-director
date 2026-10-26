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
