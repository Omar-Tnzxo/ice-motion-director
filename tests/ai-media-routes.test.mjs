// Guards for release 0.2.21: the browser generation route (Google Flow), generated-take review,
// mascot gestures, voice clip cuts, and the music lessons (L77 to L79). Zero dependencies.
// Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readText } from "./helpers.mjs";

const POLICY = "skills/ice-assets/references/ai-media-policy.md";
const FLOW = "skills/ice-assets/references/google-flow-browser.md";
const section = (text, n) => {
  const start = text.indexOf(`\n## ${n}. `);
  assert.ok(start >= 0, `no section ${n}`);
  const next = text.indexOf("\n## ", start + 4);
  return text.slice(start, next < 0 ? undefined : next);
};

test("the browser route stops at sign-in, plan, payment and terms pages and at the unusual activity flag", () => {
  const s10 = section(readText(POLICY), 10);
  assert.match(s10, /\*\*The user signs in\.\*\*/);
  assert.match(s10, /never types a password, a key or a code/);
  assert.match(s10, /never picks an account or switches accounts/);
  assert.match(s10, /never buys credits or a plan/);
  assert.match(s10, /sign-in, account picker, plan, payment, consent or terms page stops the route/);
  assert.match(s10, /PUBLIC_ERROR_UNUSUAL_ACTIVITY/);
  assert.match(s10, /rate or quota warning/);
  assert.match(s10, /\*\*Stills first\.\*\*/);
  assert.match(s10, /\*\*One at a time, paced\.\*\*/);
  assert.match(s10, /waits for the user's yes \(router stop C/);
  assert.match(readText(POLICY), /a provider website the user signs into in the agent's own browser \(section 10\)/);
  const flow = readText(FLOW);
  for (const n of [2, 4, 6]) section(flow, n);
  assert.match(flow, /the user signs in/);
  assert.match(flow, /wait for their yes/);
  assert.match(flow, /PUBLIC_ERROR_UNUSUAL_ACTIVITY/);
});

test("the router's stops table carries stop C for each paid browser round, and ice-assets points to the Flow file", () => {
  const router = readText("skills/ice-motion-director/SKILL.md");
  const stops = router.slice(router.indexOf("### Stops"), router.indexOf("## 6. "));
  const c = stops.split(/\r?\n/).find((l) => l.startsWith("| Auto and step | C."));
  assert.ok(c, "no stop C");
  assert.match(c, /before the click/);
  assert.match(c, /no paid round is made/);
  assert.match(readText("skills/ice-assets/SKILL.md"), /\| `references\/google-flow-browser\.md` \|/);
});

test("no file of the browser route tells the agent to type a password, buy credits or accept terms", () => {
  const text = readText(FLOW) + section(readText(POLICY), 10);
  for (const bad of [/\b(type|enter) (the|a|your) password/i, /\bbuy (the )?credits\b(?! or a plan)/i, /\baccept (the )?terms\b/i]) {
    for (const line of text.split(/\r?\n/)) {
      if (bad.test(line)) assert.match(line, /never/i, `a line allows a forbidden step: ${line}`);
    }
  }
});

test("generated takes are reviewed for devices, physics, scale and gestures (L78)", () => {
  const s6 = section(readText(POLICY), 6);
  assert.match(s6, /^\| Devices and physics \|.*locked or dark phone being used/m);
  assert.match(s6, /^\| Scale and reactions \|/m);
  const brand = section(readText("skills/ice-assets/references/brand-authenticity.md"), 5);
  assert.match(brand, /Never one raised finger on any hand/);
  assert.match(brand, /Keep the art unmirrored/);
});

test("voice: every cut clip is measured over its whole length", () => {
  assert.match(readText("skills/ice-audio/references/voice-director.md"), /measure each cut clip's loudness over its whole length/);
});

test("music: starts on its own start, no solo hand drum, directions before ranking, the platform's feeling, beats edit but never decide, the turn leads the bed (L79)", () => {
  const mc = readText("skills/ice-audio/references/music-choice-and-licensing.md");
  assert.match(mc, /starting on the track's first sound or a section's first downbeat \(never from the middle of a phrase\)/);
  assert.match(mc, /a solo hand drum \(darbuka, tabla, any lone percussion\)/);
  assert.match(mc, /the first listen is 3 to 4 directions far apart/);
  assert.match(mc, /never the genre on its own/);
  assert.match(mc, /feeling of the platform or app the film is for/);
  assert.match(mc, /never a reason to pick a track/);
  const cm = readText("skills/ice-audio/references/cue-map-and-beat-sync.md");
  assert.match(section(cm, 9), /music-and-effects stem, never its full mix/);
  assert.match(cm, /a close beat fit never decides which track wins/);
  assert.match(readText("skills/ice-remake/references/frame-templates.md"), /sound\.music_spec\.turn_treatment/);
});

test("a reversed note stays visible as superseded and briefs quote the current one", () => {
  assert.match(readText("skills/ice-direction/references/intake-and-brief.md"), /Every later builder or critic brief quotes the current row, never the superseded one/);
});
