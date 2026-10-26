// run-log.mjs: masking, media embedding and the HTML page of ice/case-study/run-log.html.
// Original to Ice Motion Director (Apache-2.0). A module used by export-case-study.mjs; it does nothing when run alone.
//
// The page is ONE self-contained file: inline CSS, no scripts, no network requests, every image and the preview
// video embedded as data URIs, each message with dir="auto" so Arabic and other right-to-left text reads right.
// Masking applies only to what this module writes; ice/log/conversation.jsonl stays verbatim.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";

export const LIMITS = { images: 24, imageSide: 960, imageQuality: 70, rawImageBytes: 300 * 1024, videoBytes: 4 * 1024 * 1024, videoWidth: 640, totalBytes: 8 * 1024 * 1024, videoSeconds: 600 };

// ---------------------------------------------------------------- masking
const KEY_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{16,}/g,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bglpat-[A-Za-z0-9_-]{20,}/g,
  /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bAIza[0-9A-Za-z_-]{30,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\b(?:hf|npm)_[A-Za-z0-9]{30,}/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/g,
];
const LABELLED_SECRET = /\b((?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|secret|password|passwd|token)\s*[:=]\s*)["']?[^\s"']{8,}["']?/gi;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const FILE_URL = /\bfile:\/\/\/?([^\s"'<>]+)/gi;
const QUOTED_WIN_PATH =/(["'])([A-Za-z]:[\\/][^"'\r\n]*)\1/g;
const WIN_PATH = /(?<![A-Za-z0-9])[A-Za-z]:[\\/][^\s"'<>|*?]*/g;
const UNC_PATH = /\\\\[^\s\\/]+\\[^\s"'<>|]*/g;
const POSIX_PATH = /(?<![\w.:/~-])(?:\/(?:Users|home|root|tmp|var|private|mnt|opt|Volumes|etc|srv|media|usr|data|workspace|run)\/[^\s"'<>|]*|~\/[^\s"'<>|]+)/g;
const PHONE = /(?<![\w+/.-])\+?\d[\d ().-]{7,20}\d(?![\w/])/g;

// Masks keys and tokens, email addresses, phone numbers and absolute paths (cut to a project-relative path when the
// path is inside the project, else to the file name). `counts` tells what was masked.
export function createMasker(projectDir) {
  const counts = { keys: 0, emails: 0, phones: 0, paths: 0 };
  const proj = projectDir.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
  const shortPath = (raw) => {
    const trail = (raw.match(/[.,;:)\]]+$/) || [""])[0];
    const p = raw.slice(0, raw.length - trail.length).replace(/\\/g, "/");
    counts.paths++;
    if (p.toLowerCase().startsWith(`${proj}/`)) return p.slice(proj.length + 1) + trail;
    const last = p.split("/").filter(Boolean).pop() || "";
    return (last && !/^[A-Za-z]:$/.test(last) ? last : "[path masked]") + trail;
  };
  // The project folder itself may hold spaces, so it is cut first, by its exact text, with either slash.
  const projectPrefix = new RegExp(`${projectDir.replace(/[\\/]+$/, "").split(/[\\/]+/).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\\\/]+")}[\\\\/]+([^\\s"'<>|]*)`, "gi");
  const mask = (input) => {
    let t = String(input ?? "");
    if (!t) return t;
    for (const re of KEY_PATTERNS) t = t.replace(re, () => { counts.keys++; return "[key masked]"; });
    t = t.replace(LABELLED_SECRET, (m, label) => { counts.keys++; return `${label}[key masked]`; });
    t = t.replace(EMAIL, () => { counts.emails++; return "[email masked]"; });
    t = t.replace(projectPrefix, (m, rest) => { counts.paths++; return rest.replace(/\\/g, "/"); });
    t = t.replace(FILE_URL, (m, p) => shortPath(p));
    t = t.replace(QUOTED_WIN_PATH, (m, q, p) => `${q}${shortPath(p)}${q}`);
    t = t.replace(UNC_PATH, shortPath).replace(WIN_PATH, shortPath).replace(POSIX_PATH, shortPath);
    t = t.replace(PHONE, (m) => {
      const digits = m.replace(/\D/g, "").length;
      if (digits < 9 || digits > 15 || /\d{4}-\d{2}-\d{2}/.test(m) || /^\d+\.\d+$/.test(m)) return m;
      counts.phones++;
      return "[phone masked]";
    });
    return t;
  };
  return { mask, counts };
}

// ---------------------------------------------------------------- media
// SVG is embedded only as an <img> source, where its scripts never run (the sound map picture of a recipe).
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };
const dataUri = (buf, mime) => `data:${mime};base64,${buf.toString("base64")}`;

// One temp folder per export; call cleanup() when done.
export function createEmbedder({ ffmpeg }) {
  let tmp = null;
  let n = 0;
  const out = (ext) => { tmp ??= mkdtempSync(join(tmpdir(), "ice-run-log-")); return join(tmp, `${++n}${ext}`); };
  const run = (args) => spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "ignore", "pipe"] }).status === 0;
  const box = `scale=w='min(${LIMITS.imageSide},iw)':h='min(${LIMITS.imageSide},ih)':force_original_aspect_ratio=decrease`;
  const webp = (input) => {
    const f = out(".webp");
    if (!run([...input, "-frames:v", "1", "-vf", box, "-c:v", "libwebp", "-quality", String(LIMITS.imageQuality), f]) || !existsSync(f)) return null;
    return dataUri(readFileSync(f), "image/webp");
  };
  return {
    // { uri } or { skipped: "<reason>" }
    image(src) {
      if (ffmpeg && extname(src).toLowerCase() !== ".svg") { const uri = webp(["-i", src]); if (uri) return { uri }; }
      const mime = MIME[extname(src).toLowerCase()];
      if (!mime) return { skipped: ffmpeg ? "ffmpeg could not convert it" : "not a PNG, JPEG, WebP, GIF or SVG file, and ffmpeg is not on PATH to convert it" };
      const size = statSync(src).size;
      if (size >= LIMITS.rawImageBytes) return { skipped: `${Math.round(size / 1024)} KB, over the ${LIMITS.rawImageBytes / 1024} KB limit for files embedded without ffmpeg` };
      return { uri: dataUri(readFileSync(src), mime) };
    },
    still(film, seconds) {
      if (!ffmpeg) return { skipped: "ffmpeg not on PATH, so no still can be taken from a video" };
      const uri = webp(["-ss", String(Math.max(0, seconds)), "-i", film]);
      return uri ? { uri } : { skipped: "ffmpeg could not take a still" };
    },
    // H.264 about 640 px wide with AAC about 64 kbps, kept only at 4 MB or less.
    preview(film, info) {
      if (!ffmpeg) return { skipped: "ffmpeg not on PATH, so no preview video was made" };
      if (info?.seconds > LIMITS.videoSeconds) return { skipped: `the film is ${Math.round(info.seconds)} s long, too long for a preview under ${LIMITS.videoBytes / 1048576} MB` };
      const f = out(".mp4");
      const vf = `scale='min(${LIMITS.videoWidth},iw)':-2${info?.fps > 30 ? ",fps=30" : ""}`;
      if (!run(["-i", film, "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", f]) || !existsSync(f)) return { skipped: "ffmpeg could not encode the preview" };
      const size = statSync(f).size;
      if (size > LIMITS.videoBytes) return { skipped: `the preview came out at ${(size / 1048576).toFixed(1)} MB, over the ${LIMITS.videoBytes / 1048576} MB limit` };
      return { uri: dataUri(readFileSync(f), "video/mp4"), bytes: size };
    },
    cleanup() { if (tmp) rmSync(tmp, { recursive: true, force: true }); },
  };
}

// ---------------------------------------------------------------- page
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const when = (iso) => { const m = String(iso || "").match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/); return m ? `${m[1]} ${m[2]} UTC` : esc(iso); };

const CSS = `:root{--bg:#f6f5f2;--card:#fff;--ink:#1d1d1b;--muted:#6b6a66;--line:#e2e0da;--user:#eef3ee;--agent:#fff;--accent:#2f6f4f}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--card:#1e1e1c;--ink:#ecebe6;--muted:#a3a19a;--line:#33322f;--user:#1f2a23;--agent:#1e1e1c;--accent:#7cc39c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans","Noto Sans Arabic",Tahoma,sans-serif}
main{max-width:880px;margin:0 auto;padding:24px 16px 48px}h1{font-size:28px;line-height:1.2;margin:4px 0 12px}h2{font-size:18px;margin:32px 0 12px}h3{font-size:15px;margin:20px 0 8px;color:var(--muted)}
.kicker{margin:0;color:var(--accent);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.06em}.label{color:var(--muted)}
dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;margin:0}dt{color:var(--muted)}dd{margin:0;overflow-wrap:anywhere}
blockquote{margin:0;padding:12px 16px;background:var(--card);border:1px solid var(--line);border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere}
.result img,.result video{display:block;width:100%;height:auto;border-radius:8px;border:1px solid var(--line);margin-top:8px;background:#000}
details{margin-top:16px;color:var(--muted);font-size:13px}ol.turns{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.turn{padding:10px 14px;border:1px solid var(--line);border-radius:8px;background:var(--agent)}.turn.user{background:var(--user)}
.meta{font-size:12px;color:var(--muted);margin-bottom:4px}.text{white-space:pre-wrap;overflow-wrap:anywhere}.att{margin:6px 0 0;padding-inline-start:18px;font-size:13px;color:var(--muted)}
a{color:var(--accent)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden}figure img{display:block;width:100%;height:auto}
figcaption{padding:6px 10px;font-size:12px;color:var(--muted);overflow-wrap:anywhere}footer{margin-top:40px;font-size:12px;color:var(--muted)}`;

// header: { title, brand, unofficial, prompt, language, facts: [[label, value]], poster, video, finalName,
//          recipe: null | { file, sections, prompt, unknowns } (a recipe-only run: shown in place of the final result) }
// turns: [{ at, stage, stageName, from, text, note, attachments: [{ name, kind, direction, anchor }] }]
// groups: [{ heading, items: [{ id, uri, caption }] }]
export function renderRunLog({ header, turns, groups, notes }) {
  const h = header;
  const facts = h.facts.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd dir="auto">${esc(v)}</dd>`).join("");
  const result = [
    h.poster ? `<img src="${h.poster}" alt="Still from the final film">` : "",
    h.video ? `<video controls preload="metadata" playsinline src="${h.video}"></video>` : "",
    !h.poster && !h.video ? `<p class="label">${h.finalName ? `No preview is embedded. The final film is ${esc(h.finalName)}.` : "No final film was found in the run files."}</p>` : "",
    h.poster && !h.video && h.finalName ? `<p class="label">The final film is ${esc(h.finalName)}; it is too large to embed, so only a still is shown.</p>` : "",
  ].join("");
  const r = h.recipe;
  const recipeHtml = r ? `<p class="label">No film is made in a recipe-only run; the deliverable is the style recipe <span dir="auto">${esc(r.file)}</span>. Its pictures are under Images.</p>`
    + (r.sections.length ? `<h3>Sections</h3><ul>${r.sections.map((x) => `<li dir="auto">${esc(x)}</li>`).join("")}</ul>` : "")
    + `<h3>Prompt block</h3>${r.prompt ? `<blockquote dir="auto">${esc(r.prompt)}</blockquote>` : `<p class="label">No prompt block was found in the recipe.</p>`}`
    + (r.unknowns.length ? `<h3>Unknowns</h3><ul>${r.unknowns.map((x) => `<li dir="auto">${esc(x)}</li>`).join("")}</ul>` : "") : "";
  const turnHtml = turns.length ? `<ol class="turns">${turns.map((t) => {
    const who = t.from === "user" ? "User" : "Agent (summary)";
    const att = t.attachments.length ? `<ul class="att">${t.attachments.map((a) => a.excluded ? `<li>${esc(a.name)}: ${esc(a.excluded)}</li>` : `<li>${a.anchor ? `<a href="#${a.anchor}">${esc(a.name)}</a>` : esc(a.name)}, ${esc(a.kind)}, ${a.direction === "from_user" ? "from the user" : "sent to the user"}</li>`).join("")}</ul>` : "";
    const note = t.note ? `<p class="att" dir="auto">Shown in chat: ${esc(t.note)}</p>` : "";
    const text = t.text ? `<div class="text" dir="auto">${esc(t.text)}</div>` : "";
    return `<li class="turn ${t.from === "user" ? "user" : "agent"}"><div class="meta">${who}, stage ${esc(t.stage || "unknown")}${t.stageName ? ` ${esc(t.stageName)}` : ""}, ${when(t.at)}</div>${text}${note}${att}</li>`;
  }).join("")}</ol>` : `<p class="label">This run kept no run log.</p>`;
  const media = groups.filter((g) => g.items.length).map((g) => `<h3>${esc(g.heading)}</h3><div class="grid">${g.items.map((m) => `<figure id="${m.id}"><img src="${m.uri}" alt="${esc(m.caption)}" loading="lazy"><figcaption dir="auto">${esc(m.caption)}</figcaption></figure>`).join("")}</div>`).join("");
  const noteList = notes.length ? `<details><summary>Export notes (${notes.length})</summary><ul>${notes.map((n) => `<li>${esc(n.field)}: ${esc(n.note)}</li>`).join("")}</ul></details>` : "";
  return `<!doctype html>
<html lang="${esc(h.language || "en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(h.title ? `Run log: ${h.title}` : "Run log")}</title><style>${CSS}</style></head>
<body><main>
<header><p class="kicker">Run log</p><h1 dir="auto">${esc(h.title || "Untitled run")}</h1>${h.unofficial && h.brand ? `<p class="label" dir="auto">Unofficial concept, not affiliated with ${esc(h.brand)}</p>` : ""}<dl>${facts}</dl>
<h2>The prompt</h2>${h.prompt ? `<blockquote dir="auto">${esc(h.prompt)}</blockquote>` : `<p class="label">The prompt was not found in the run files.</p>`}
${r ? `<section class="result"><h2>The recipe</h2>${recipeHtml}</section>` : `<section class="result"><h2>Final result</h2>${result}</section>`}${noteList}</header>
<section><h2>The conversation</h2>${turnHtml}</section>
<section><h2>Images</h2>${media || `<p class="label">No images were embedded.</p>`}</section>
<footer>Exported by Ice Motion Director. This file stays on your machine; it makes no network requests.</footer>
</main></body></html>
`;
}

export const nameOf = (p) => basename(String(p || ""));
