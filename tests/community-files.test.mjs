// Community files for the public repo: contributing guide, security policy, code of conduct, issue forms, pull
// request template and the social preview. Run: node --test tests/
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { abs, readText, repoFiles } from "./helpers.mjs";

const FILES = ["CONTRIBUTING.md", "SECURITY.md", "CODE_OF_CONDUCT.md", ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/bug_report.yml", ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/gallery_submission.yml", ".github/ISSUE_TEMPLATE/config.yml",
  "brand/social-preview.html", "assets/readme/social-preview.png"];

test("community files exist", () => {
  assert.deepEqual(FILES.filter((f) => !existsSync(abs(f))), []);
});

test("the pre-push hook is the documented gate, with no hosted CI", () => {
  const contributing = readText("CONTRIBUTING.md");
  assert.match(contributing, /git config core\.hooksPath \.githooks/);
  assert.match(contributing, /node scripts\/gates\.mjs --all/);
  assert.match(contributing, /no hosted CI/i);
  assert.match(contributing, /--no-verify/, "the guide forbids skipping the hook");
  assert.match(readText(".githooks/pre-push"), /^exec node scripts\/gates\.mjs$/m);
  assert.equal(repoFiles().filter((f) => f.startsWith(".github/workflows/")).length, 0, "no GitHub Actions workflow");
  assert.match(readText(".github/PULL_REQUEST_TEMPLATE.md"), /node scripts\/gates\.mjs/);
});

test("contributing points to AGENTS.md and the maintainer docs instead of restating them", () => {
  const contributing = readText("CONTRIBUTING.md");
  assert.match(contributing, /\(AGENTS\.md\)/);
  assert.match(contributing, /\(docs\/maintainers\/\)/);
});

test("security policy uses private vulnerability reporting and names the scope", () => {
  const security = readText("SECURITY.md");
  assert.match(security, /private vulnerability reporting/i);
  assert.match(security, /security\/advisories\/new/);
  assert.match(security, /bundled scripts/i);
  assert.match(security, /install paths/i);
  assert.match(security, /latest release/i);
});

test("code of conduct is Contributor Covenant 2.1 with its placeholder filled and its licence named", () => {
  const coc = readText("CODE_OF_CONDUCT.md");
  assert.match(coc, /^# Contributor Covenant Code of Conduct/);
  assert.match(coc, /version 2\.1/);
  assert.doesNotMatch(coc, /\[INSERT CONTACT METHOD\]/);
  assert.match(coc, /CC BY 4\.0/);
});

test("issue forms ask for what a bug needs and link the site and Discussions", () => {
  const bug = readText(".github/ISSUE_TEMPLATE/bug_report.yml");
  for (const id of ["agent", "os", "install", "ice-version", "prompt", "stage", "gates", "run-log"]) {
    assert.match(bug, new RegExp(`^    id: ${id}$`, "m"), `bug report asks for ${id}`);
  }
  assert.match(bug, /ice\/case-study\/run-log\.html/);
  const config = readText(".github/ISSUE_TEMPLATE/config.yml");
  assert.match(config, /ice-motion-director\.omarhassan\.workers\.dev/);
  assert.match(config, /\/discussions/);
});

test("social preview is a 1280x640 PNG under 1 MB", () => {
  const png = readFileSync(abs("assets/readme/social-preview.png"));
  assert.equal(png.subarray(1, 4).toString("latin1"), "PNG");
  assert.equal(png.readUInt32BE(16), 1280);
  assert.equal(png.readUInt32BE(20), 640);
  assert.ok(statSync(abs("assets/readme/social-preview.png")).size < 1024 * 1024, "under 1 MB");
});
