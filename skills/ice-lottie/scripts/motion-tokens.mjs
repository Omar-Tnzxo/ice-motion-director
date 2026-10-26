#!/usr/bin/env node
// From Omar-Tnzxo/motion-interaction-studio (owned by the founder, Apache-2.0 in this repo). Changes: --help reads this file through fileURLToPath; a --custom JSON saved with a UTF-8 byte order mark (Windows editors add one) is accepted; the preset reference it names is summarized in references/ui-motion-tokens.md.
// Motion tokens generator (motion-interaction-studio skill).
// Takes a motion personality preset (see references/personality-by-industry.md) and prints
// the same tokens for every platform: CSS custom properties (with spring linear() curves and a
// reduced motion block), a TypeScript object (motion/react ready), a Dart class (Flutter),
// a Swift enum (SwiftUI), Kotlin objects (Jetpack Compose) and plain JSON.
//
// No dependencies, no network. Node 18+.
//
// Usage:
//   node motion-tokens.mjs --list
//   node motion-tokens.mjs --preset gaming-esports --format css
//   node motion-tokens.mjs --preset fintech-banking --format all --out ./tokens
//   node motion-tokens.mjs --custom my-brand.json --format ts
//   node motion-tokens.mjs --preset saas-devtools --set dur.fast=220 --set spring.glide.bounce=0.05 --format dart
//
// Options:
//   --list                 list presets with a one line summary
//   --preset <id>          preset id (default: neutral)
//   --custom <file.json>   JSON preset; may contain "extends": "<preset id>" and any subset of fields
//   --set path=value       override one value (repeatable), e.g. dur.fast=220, dist.reveal=10
//   --format <f>           css | ts | dart | swift | kotlin | json | all (default: css)
//   --out <dir>            write files instead of printing (required for --format all)
//   --prefix <p>           CSS variable prefix (default: motion)
//   --name <Name>          class / object name for Dart, Swift, Kotlin, TS (default: MotionTokens)
//
// Spring model: every spring is authored as { duration (visual, ms), bounce (0..1) }, the
// SwiftUI / Motion convention. It is converted to physics with mass 1:
//   stiffness = (2 * PI / duration_s)^2, dampingRatio = 1 - bounce, damping = 2 * dampingRatio * sqrt(stiffness)
// The CSS output samples the exact step response into a linear() easing and reports the real
// settle time, so web, Flutter, React Native, SwiftUI and Compose all move the same way.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Curves ────────────────────────────────────────────────────────────────
const C = {
  broadcastOut: [0.23, 1, 0.32, 1],
  standardOut: [0.2, 0, 0, 1],
  standard: [0.4, 0, 0.2, 1],
  standardIn: [0.4, 0, 1, 1],
  expoOut: [0.16, 1, 0.3, 1],
  expoInOut: [0.87, 0, 0.13, 1],
  quartOut: [0.25, 1, 0.5, 1],
  quintOut: [0.22, 1, 0.36, 1],
  iosSheet: [0.32, 0.72, 0, 1],
  gentle: [0.25, 0.1, 0.25, 1],
  sineInOut: [0.37, 0, 0.63, 1],
  cubicInOut: [0.65, 0, 0.35, 1],
  backOut: [0.34, 1.56, 0.64, 1],
  softBackOut: [0.34, 1.3, 0.64, 1],
  emphasizedDecel: [0.05, 0.7, 0.1, 1],
  emphasizedAccel: [0.3, 0, 0.8, 0.15],
  quadIn: [0.5, 0, 0.75, 0],
};

// ─── Presets ───────────────────────────────────────────────────────────────
// dur: ms. spring: { d: visual ms, b: bounce }. dist: px. stagger: ms. hold: ms (0 = do not use hold
// to confirm, prefer an explicit confirmation step). haptics: none | light | medium | rich.
const base = (o) => ({
  dur: { tap: 90, instant: 120, quick: 180, fast: 240, normal: 360, slow: 520, xslow: 720 },
  ease: { out: C.standardOut, inOut: C.standard, in: C.standardIn, emphasized: C.emphasizedDecel },
  spring: { snap: { d: 260, b: 0 }, glide: { d: 340, b: 0.08 }, land: { d: 420, b: 0.12 } },
  dist: { label: 8, reveal: 12, page: 8, pressScale: 0.975, magnet: 0 },
  stagger: { step: 40, max: 320 },
  hold: 1400,
  haptics: 'light',
  ...o,
});

const PRESETS = {
  neutral: base({
    label: 'Neutral (balanced default)',
    summary: 'Balanced product motion when the category is unknown: quick, damped, small travel.',
  }),
  'gaming-esports': base({
    label: 'Gaming and esports',
    summary: 'Broadcast graphics: slam in, land exactly, leave faster. Confident, never toy-like.',
    dur: { tap: 90, instant: 120, quick: 180, fast: 250, normal: 400, slow: 600, xslow: 800 },
    ease: { out: C.broadcastOut, inOut: C.standard, in: C.standardIn, emphasized: C.iosSheet },
    spring: { snap: { d: 260, b: 0 }, glide: { d: 340, b: 0.12 }, land: { d: 400, b: 0.15 } },
    dist: { label: 8, reveal: 12, page: 8, pressScale: 0.975, magnet: 6 },
    stagger: { step: 50, max: 400 },
    hold: 1400,
    haptics: 'medium',
  }),
  'fintech-banking': base({
    label: 'Fintech and banking',
    summary: 'Calm precision that signals trust: no bounce, short travel, numbers that settle cleanly.',
    dur: { tap: 100, instant: 140, quick: 200, fast: 260, normal: 360, slow: 520, xslow: 700 },
    ease: { out: C.standardOut, inOut: C.standard, in: C.standardIn, emphasized: C.emphasizedDecel },
    spring: { snap: { d: 280, b: 0 }, glide: { d: 360, b: 0 }, land: { d: 420, b: 0.05 } },
    dist: { label: 6, reveal: 8, page: 6, pressScale: 0.98, magnet: 0 },
    stagger: { step: 40, max: 300 },
    hold: 1500,
    haptics: 'light',
  }),
  healthcare: base({
    label: 'Healthcare and wellbeing',
    summary: 'Gentle and reassuring: slower, almost no travel, never startling, reduced motion friendly by default.',
    dur: { tap: 100, instant: 160, quick: 220, fast: 300, normal: 420, slow: 600, xslow: 800 },
    ease: { out: C.gentle, inOut: C.sineInOut, in: C.standardIn, emphasized: C.quartOut },
    spring: { snap: { d: 320, b: 0 }, glide: { d: 400, b: 0 }, land: { d: 480, b: 0.05 } },
    dist: { label: 4, reveal: 8, page: 6, pressScale: 0.985, magnet: 0 },
    stagger: { step: 40, max: 240 },
    hold: 1600,
    haptics: 'light',
  }),
  'kids-education': base({
    label: 'Kids and education',
    summary: 'Playful and encouraging: visible bounce, bigger travel, celebratory rewards, slower reading pace.',
    dur: { tap: 100, instant: 150, quick: 220, fast: 320, normal: 480, slow: 700, xslow: 1000 },
    ease: { out: C.softBackOut, inOut: C.cubicInOut, in: C.standardIn, emphasized: C.backOut },
    spring: { snap: { d: 300, b: 0.2 }, glide: { d: 400, b: 0.3 }, land: { d: 500, b: 0.35 } },
    dist: { label: 12, reveal: 24, page: 16, pressScale: 0.94, magnet: 0 },
    stagger: { step: 70, max: 600 },
    hold: 1000,
    haptics: 'rich',
  }),
  'luxury-fashion': base({
    label: 'Luxury and fashion',
    summary: 'Editorial and unhurried: long expo eases, image led reveals, restraint over feedback noise.',
    dur: { tap: 120, instant: 200, quick: 300, fast: 450, normal: 700, slow: 1000, xslow: 1400 },
    ease: { out: C.expoOut, inOut: C.cubicInOut, in: C.quadIn, emphasized: C.expoInOut },
    spring: { snap: { d: 500, b: 0 }, glide: { d: 700, b: 0 }, land: { d: 800, b: 0.05 } },
    dist: { label: 8, reveal: 24, page: 16, pressScale: 0.99, magnet: 0 },
    stagger: { step: 80, max: 640 },
    hold: 1600,
    haptics: 'light',
  }),
  'ecommerce-retail': base({
    label: 'E-commerce and retail',
    summary: 'Brisk and rewarding: fast feedback on add to cart, lively but short celebrations, never slows checkout.',
    dur: { tap: 90, instant: 120, quick: 180, fast: 240, normal: 360, slow: 520, xslow: 700 },
    ease: { out: C.quintOut, inOut: C.standard, in: C.standardIn, emphasized: C.softBackOut },
    spring: { snap: { d: 260, b: 0.05 }, glide: { d: 320, b: 0.15 }, land: { d: 400, b: 0.2 } },
    dist: { label: 8, reveal: 16, page: 10, pressScale: 0.97, magnet: 4 },
    stagger: { step: 40, max: 320 },
    hold: 1200,
    haptics: 'medium',
  }),
  'saas-devtools': base({
    label: 'B2B SaaS and developer tools',
    summary: 'Fast, precise, nearly invisible: motion only explains state, keyboard speed is sacred.',
    dur: { tap: 80, instant: 100, quick: 150, fast: 200, normal: 300, slow: 450, xslow: 600 },
    ease: { out: C.standardOut, inOut: C.standard, in: C.standardIn, emphasized: C.emphasizedDecel },
    spring: { snap: { d: 220, b: 0 }, glide: { d: 280, b: 0 }, land: { d: 340, b: 0.08 } },
    dist: { label: 4, reveal: 8, page: 6, pressScale: 0.98, magnet: 0 },
    stagger: { step: 30, max: 200 },
    hold: 1200,
    haptics: 'none',
  }),
  'media-streaming': base({
    label: 'Media and streaming',
    summary: 'Cinematic and immersive: smooth crossfades, artwork led transitions, focus scale for TV.',
    dur: { tap: 100, instant: 150, quick: 220, fast: 320, normal: 500, slow: 750, xslow: 1000 },
    ease: { out: C.quintOut, inOut: C.cubicInOut, in: C.standardIn, emphasized: C.expoOut },
    spring: { snap: { d: 320, b: 0 }, glide: { d: 420, b: 0.08 }, land: { d: 500, b: 0.1 } },
    dist: { label: 8, reveal: 20, page: 16, pressScale: 0.97, magnet: 0 },
    stagger: { step: 50, max: 400 },
    hold: 1400,
    haptics: 'light',
  }),
  'social-creator': base({
    label: 'Social and creator',
    summary: 'Lively and expressive: gesture first, springy reactions, bold but brief.',
    dur: { tap: 80, instant: 120, quick: 180, fast: 260, normal: 380, slow: 560, xslow: 800 },
    ease: { out: C.quintOut, inOut: C.standard, in: C.standardIn, emphasized: C.backOut },
    spring: { snap: { d: 260, b: 0.1 }, glide: { d: 340, b: 0.2 }, land: { d: 420, b: 0.25 } },
    dist: { label: 8, reveal: 16, page: 12, pressScale: 0.95, magnet: 0 },
    stagger: { step: 40, max: 320 },
    hold: 1000,
    haptics: 'rich',
  }),
  'travel-hospitality': base({
    label: 'Travel and hospitality',
    summary: 'Airy and inviting: smooth photo reveals, parallax kept subtle, booking steps stay quick.',
    dur: { tap: 100, instant: 150, quick: 220, fast: 300, normal: 450, slow: 650, xslow: 900 },
    ease: { out: C.quartOut, inOut: C.cubicInOut, in: C.standardIn, emphasized: C.expoOut },
    spring: { snap: { d: 320, b: 0.05 }, glide: { d: 400, b: 0.1 }, land: { d: 480, b: 0.12 } },
    dist: { label: 8, reveal: 20, page: 12, pressScale: 0.98, magnet: 0 },
    stagger: { step: 60, max: 480 },
    hold: 1400,
    haptics: 'light',
  }),
  'food-delivery': base({
    label: 'Food and delivery',
    summary: 'Warm, quick and rewarding: appetizing reveals, cart bumps, live order tracking that reassures.',
    dur: { tap: 80, instant: 120, quick: 180, fast: 240, normal: 360, slow: 520, xslow: 800 },
    ease: { out: C.quintOut, inOut: C.standard, in: C.standardIn, emphasized: C.softBackOut },
    spring: { snap: { d: 240, b: 0.1 }, glide: { d: 320, b: 0.2 }, land: { d: 400, b: 0.25 } },
    dist: { label: 8, reveal: 16, page: 12, pressScale: 0.95, magnet: 0 },
    stagger: { step: 40, max: 320 },
    hold: 1200,
    haptics: 'medium',
  }),
  'real-estate': base({
    label: 'Real estate and property',
    summary: 'Composed and spacious: photo first, slow galleries, map and list transitions that keep context.',
    dur: { tap: 100, instant: 150, quick: 220, fast: 320, normal: 480, slow: 700, xslow: 1000 },
    ease: { out: C.quartOut, inOut: C.cubicInOut, in: C.standardIn, emphasized: C.expoOut },
    spring: { snap: { d: 340, b: 0 }, glide: { d: 420, b: 0.05 }, land: { d: 500, b: 0.08 } },
    dist: { label: 6, reveal: 16, page: 12, pressScale: 0.985, magnet: 0 },
    stagger: { step: 60, max: 420 },
    hold: 1500,
    haptics: 'light',
  }),
  'fitness-sports': base({
    label: 'Fitness and sports',
    summary: 'Energetic and punchy: progress rings that fill, streak bursts, timers that read at a glance.',
    dur: { tap: 80, instant: 110, quick: 160, fast: 220, normal: 340, slow: 500, xslow: 800 },
    ease: { out: C.broadcastOut, inOut: C.standard, in: C.standardIn, emphasized: C.softBackOut },
    spring: { snap: { d: 220, b: 0.1 }, glide: { d: 300, b: 0.2 }, land: { d: 380, b: 0.25 } },
    dist: { label: 10, reveal: 16, page: 12, pressScale: 0.95, magnet: 0 },
    stagger: { step: 40, max: 320 },
    hold: 1200,
    haptics: 'rich',
  }),
  'government-public': base({
    label: 'Government and public services',
    summary: 'Functional and accessible first: almost no travel, no scale, no decoration, explicit confirmations.',
    dur: { tap: 100, instant: 120, quick: 160, fast: 200, normal: 250, slow: 300, xslow: 400 },
    ease: { out: C.standard, inOut: C.standard, in: C.standardIn, emphasized: C.standard },
    spring: { snap: { d: 240, b: 0 }, glide: { d: 280, b: 0 }, land: { d: 320, b: 0 } },
    dist: { label: 0, reveal: 4, page: 0, pressScale: 1, magnet: 0 },
    stagger: { step: 0, max: 0 },
    hold: 0,
    haptics: 'none',
  }),
  'crypto-web3': base({
    label: 'Crypto and web3',
    summary: 'Precise and technical: live prices tick without drama, signing is deliberate, no hype glow.',
    dur: { tap: 80, instant: 110, quick: 160, fast: 220, normal: 320, slow: 480, xslow: 700 },
    ease: { out: C.standardOut, inOut: C.standard, in: C.standardIn, emphasized: C.expoOut },
    spring: { snap: { d: 220, b: 0 }, glide: { d: 300, b: 0.05 }, land: { d: 360, b: 0.1 } },
    dist: { label: 6, reveal: 10, page: 8, pressScale: 0.97, magnet: 0 },
    stagger: { step: 30, max: 240 },
    hold: 1800,
    haptics: 'medium',
  }),
  'ai-products': base({
    label: 'AI products',
    summary: 'Fluid and transparent: streaming text, honest thinking states, calm morphs between draft and result.',
    dur: { tap: 90, instant: 130, quick: 200, fast: 280, normal: 420, slow: 640, xslow: 900 },
    ease: { out: C.iosSheet, inOut: C.cubicInOut, in: C.standardIn, emphasized: C.expoOut },
    spring: { snap: { d: 300, b: 0 }, glide: { d: 380, b: 0.08 }, land: { d: 460, b: 0.1 } },
    dist: { label: 6, reveal: 12, page: 8, pressScale: 0.98, magnet: 0 },
    stagger: { step: 30, max: 300 },
    hold: 1400,
    haptics: 'light',
  }),
  productivity: base({
    label: 'Productivity and collaboration',
    summary: 'Quiet and fast: keyboard first, optimistic updates, reorder and check off feel instant.',
    dur: { tap: 70, instant: 100, quick: 140, fast: 200, normal: 280, slow: 400, xslow: 560 },
    ease: { out: C.standardOut, inOut: C.standard, in: C.standardIn, emphasized: C.emphasizedDecel },
    spring: { snap: { d: 200, b: 0 }, glide: { d: 260, b: 0.05 }, land: { d: 320, b: 0.1 } },
    dist: { label: 4, reveal: 8, page: 6, pressScale: 0.98, magnet: 0 },
    stagger: { step: 25, max: 200 },
    hold: 1200,
    haptics: 'light',
  }),
  automotive: base({
    label: 'Automotive and in-car',
    summary: 'Calm and glanceable: no stagger, no decorative motion while driving, large crossfades, firm haptics.',
    dur: { tap: 100, instant: 150, quick: 200, fast: 280, normal: 400, slow: 600, xslow: 800 },
    ease: { out: C.standardOut, inOut: C.standard, in: C.standardIn, emphasized: C.emphasizedDecel },
    spring: { snap: { d: 300, b: 0 }, glide: { d: 380, b: 0 }, land: { d: 440, b: 0.05 } },
    dist: { label: 8, reveal: 12, page: 0, pressScale: 0.98, magnet: 0 },
    stagger: { step: 0, max: 0 },
    hold: 1500,
    haptics: 'medium',
  }),
};

// ─── CLI parsing ───────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { set: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--list') args.list = true;
    else if (a === '--preset') args.preset = next();
    else if (a === '--custom') args.custom = next();
    else if (a === '--set') args.set.push(next());
    else if (a === '--format') args.format = next();
    else if (a === '--out') args.out = next();
    else if (a === '--prefix') args.prefix = next();
    else if (a === '--name') args.name = next();
    else if (a === '--help' || a === '-h') args.help = true;
    else { console.error(`Unknown argument: ${a}`); process.exit(2); }
  }
  return args;
}

const deepMerge = (a, b) => {
  if (Array.isArray(b) || typeof b !== 'object' || b === null) return b;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in (a ?? {}) ? deepMerge(a[k], v) : v;
  return out;
};

function setPath(obj, path, raw) {
  const keys = path.split('.');
  let o = obj;
  for (const k of keys.slice(0, -1)) {
    if (typeof o[k] !== 'object' || o[k] === null) throw new Error(`Unknown token path: ${path}`);
    o = o[k];
  }
  const last = keys.at(-1);
  if (!(last in o)) throw new Error(`Unknown token path: ${path}`);
  let v = raw;
  if (/^-?\d+(\.\d+)?$/.test(raw)) v = Number(raw);
  else if (raw.startsWith('[')) v = JSON.parse(raw);
  // Convenience: spring.x.bounce / spring.x.duration aliases.
  o[last] = v;
}

// ─── Spring maths ──────────────────────────────────────────────────────────
function springPhysics({ d, b }) {
  const T = d / 1000;
  const omega = (2 * Math.PI) / T;
  const stiffness = omega * omega;
  const ratio = Math.max(0.05, 1 - b); // bounce 1 would never settle
  const damping = 2 * ratio * omega; // mass 1
  return { mass: 1, stiffness: +stiffness.toFixed(2), damping: +damping.toFixed(2), ratio: +ratio.toFixed(3) };
}

function springStep(t, { stiffness, ratio }) {
  const w0 = Math.sqrt(stiffness);
  if (ratio < 1) {
    const wd = w0 * Math.sqrt(1 - ratio * ratio);
    return 1 - Math.exp(-ratio * w0 * t) * (Math.cos(wd * t) + ((ratio * w0) / wd) * Math.sin(wd * t));
  }
  if (Math.abs(ratio - 1) < 1e-9) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  // Overdamped (negative bounce in a custom preset): two real roots.
  const r1 = -w0 * (ratio - Math.sqrt(ratio * ratio - 1));
  const r2 = -w0 * (ratio + Math.sqrt(ratio * ratio - 1));
  const c1 = r2 / (r2 - r1);
  const c2 = -r1 / (r2 - r1);
  return 1 - (c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t));
}

function settleTime(p, eps = 0.001) {
  const dt = 0.001;
  let last = 0;
  for (let t = 0; t < 10; t += dt) if (Math.abs(1 - springStep(t, p)) > eps) last = t;
  return Math.max(last, 0.016);
}

function springLinear(p, points = 40) {
  const T = settleTime(p);
  const vals = [];
  for (let i = 0; i <= points; i++) {
    const t = (T * i) / points;
    let v = i === points ? 1 : springStep(t, p);
    vals.push(+v.toFixed(4));
  }
  return { css: `linear(${vals.join(', ')})`, settleMs: Math.round(T * 1000) };
}

// ─── Model ─────────────────────────────────────────────────────────────────
function build(preset) {
  const springs = {};
  for (const [k, s] of Object.entries(preset.spring)) {
    const phys = springPhysics(s);
    springs[k] = { visualMs: s.d, bounce: s.b, ...phys, ...springLinear(phys) };
  }
  return { ...preset, springs };
}

const ms = (n) => `${n}ms`;
const bez = (c) => `cubic-bezier(${c.join(', ')})`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const SCREAM = (s) => s.replace(/[A-Z]/g, (m) => `_${m}`).toUpperCase();
const f = (n) => (Number.isInteger(n) ? `${n}.0` : `${n}`);

function header(model, comment) {
  return [
    `${comment} Motion tokens: ${model.label} (preset "${model.id}").`,
    `${comment} ${model.summary}`,
    `${comment} Generated by motion-interaction-studio/tools/motion-tokens.mjs. Do not hand edit; regenerate.`,
  ].join('\n');
}

// ─── Emitters ──────────────────────────────────────────────────────────────
function emitCss(m, prefix = 'motion') {
  const v = (k) => `--${prefix}-${k}`;
  const lines = ['/*', header(m, ' *'), ' */', ':root {'];
  for (const [k, n] of Object.entries(m.dur)) lines.push(`  ${v(`dur-${k}`)}: ${ms(n)};`);
  for (const [k, c] of Object.entries(m.ease)) lines.push(`  ${v(`ease-${kebab(k)}`)}: ${bez(c)};`);
  for (const [k, s] of Object.entries(m.springs)) {
    lines.push(`  /* spring ${k}: visual ${s.visualMs}ms, bounce ${s.bounce}, settles in ${s.settleMs}ms */`);
    lines.push(`  ${v(`spring-${k}`)}: ${s.css};`);
    lines.push(`  ${v(`spring-${k}-dur`)}: ${ms(s.settleMs)};`);
  }
  lines.push(`  ${v('dist-label')}: ${m.dist.label}px;`);
  lines.push(`  ${v('dist-reveal')}: ${m.dist.reveal}px;`);
  lines.push(`  ${v('dist-page')}: ${m.dist.page}px;`);
  lines.push(`  ${v('dist-magnet')}: ${m.dist.magnet}px;`);
  lines.push(`  ${v('press-scale')}: ${m.dist.pressScale};`);
  lines.push(`  ${v('stagger-step')}: ${ms(m.stagger.step)};`);
  lines.push(`  ${v('stagger-max')}: ${ms(m.stagger.max)};`);
  lines.push(`  ${v('hold')}: ${ms(m.hold)};`);
  lines.push('}');
  lines.push('');
  lines.push('/* Reduced motion is designed, not disabled: travel, scale and stagger go; opacity, color and progress stay. */');
  lines.push('@media (prefers-reduced-motion: reduce) {');
  lines.push('  :root {');
  for (const k of ['label', 'reveal', 'page', 'magnet']) lines.push(`    ${v(`dist-${k}`)}: 0px;`);
  lines.push(`    ${v('press-scale')}: 1;`);
  lines.push(`    ${v('stagger-step')}: 0ms;`);
  for (const k of Object.keys(m.springs)) lines.push(`    ${v(`spring-${k}`)}: ${bez(m.ease.inOut)};`);
  for (const k of Object.keys(m.springs)) lines.push(`    ${v(`spring-${k}-dur`)}: ${ms(Math.min(m.dur.quick, 200))};`);
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push('/* App level override (a "Reduce motion" setting): <html data-reduce-motion="true"> */');
  lines.push(':root[data-reduce-motion="true"] {');
  for (const k of ['label', 'reveal', 'page', 'magnet']) lines.push(`  ${v(`dist-${k}`)}: 0px;`);
  lines.push(`  ${v('press-scale')}: 1;`);
  lines.push(`  ${v('stagger-step')}: 0ms;`);
  lines.push('}');
  return lines.join('\n') + '\n';
}

function emitTs(m, name = 'MotionTokens') {
  const sec = (n) => +(n / 1000).toFixed(3);
  const o = [];
  o.push(header(m, '//'));
  o.push('// Durations are in seconds for motion/react (framer-motion); `ms` mirrors them in milliseconds.');
  o.push('');
  o.push(`export const ${name} = {`);
  o.push(`  id: '${m.id}',`);
  o.push('  dur: {');
  for (const [k, n] of Object.entries(m.dur)) o.push(`    ${k}: ${sec(n)},`);
  o.push('  },');
  o.push('  ms: {');
  for (const [k, n] of Object.entries(m.dur)) o.push(`    ${k}: ${n},`);
  o.push('  },');
  o.push('  ease: {');
  for (const [k, c] of Object.entries(m.ease)) o.push(`    ${k}: [${c.join(', ')}] as [number, number, number, number],`);
  o.push('  },');
  o.push('  /** motion/react transitions: { type: "spring", visualDuration, bounce }. */');
  o.push('  spring: {');
  for (const [k, s] of Object.entries(m.springs)) o.push(`    ${k}: { type: 'spring' as const, visualDuration: ${sec(s.visualMs)}, bounce: ${s.bounce} },`);
  o.push('  },');
  o.push('  /** Same springs as physics (mass 1): useSpring(), Reanimated withSpring(), react-spring. */');
  o.push('  physics: {');
  for (const [k, s] of Object.entries(m.springs)) o.push(`    ${k}: { stiffness: ${s.stiffness}, damping: ${s.damping}, mass: 1 },`);
  o.push('  },');
  o.push('  /** CSS linear() strings of the same springs plus their real settle time in ms. */');
  o.push('  css: {');
  for (const [k, s] of Object.entries(m.springs)) o.push(`    ${k}: { easing: '${s.css}', ms: ${s.settleMs} },`);
  o.push('  },');
  o.push(`  dist: { label: ${m.dist.label}, reveal: ${m.dist.reveal}, page: ${m.dist.page}, magnet: ${m.dist.magnet}, pressScale: ${m.dist.pressScale} },`);
  o.push(`  stagger: { step: ${sec(m.stagger.step)}, max: ${sec(m.stagger.max)} },`);
  o.push(`  /** Hold to confirm length in ms (0: use an explicit confirmation step instead). */`);
  o.push(`  hold: ${m.hold},`);
  o.push(`  haptics: '${m.haptics}' as 'none' | 'light' | 'medium' | 'rich',`);
  o.push('} as const;');
  o.push('');
  o.push('/** Per item delay (seconds) that keeps the whole cascade under stagger.max. */');
  o.push(`export function staggerStep(count: number): number {`);
  o.push(`  if (count <= 1) return 0;`);
  o.push(`  return Math.min(${name}.stagger.step, ${name}.stagger.max / (count - 1));`);
  o.push('}');
  o.push('');
  o.push(`export type ${name}Type = typeof ${name};`);
  return o.join('\n') + '\n';
}

function emitDart(m, name = 'MotionTokens') {
  const o = [];
  o.push(header(m, '//'));
  o.push('// Flutter 3.x. Uses only package:flutter (animation + physics), no Material dependency,');
  o.push('// so it works with the framework Material library and with package:material_ui alike.');
  o.push("import 'package:flutter/animation.dart';");
  o.push("import 'package:flutter/physics.dart';");
  o.push('');
  o.push(`abstract final class ${name} {`);
  for (const [k, n] of Object.entries(m.dur)) o.push(`  static const Duration ${k} = Duration(milliseconds: ${n});`);
  o.push('');
  for (const [k, c] of Object.entries(m.ease)) o.push(`  static const Cubic ease${cap(k)} = Cubic(${c.map(f).join(', ')});`);
  o.push('');
  for (const [k, s] of Object.entries(m.springs)) {
    o.push(`  /// Spring "${k}": visual ${s.visualMs} ms, bounce ${s.bounce}, settles in about ${s.settleMs} ms.`);
    o.push(`  static final SpringDescription spring${cap(k)} = SpringDescription.withDampingRatio(mass: 1.0, stiffness: ${f(s.stiffness)}, ratio: ${f(s.ratio)});`);
    o.push(`  static const Duration spring${cap(k)}Settle = Duration(milliseconds: ${s.settleMs});`);
  }
  o.push('');
  o.push(`  static const double distLabel = ${f(m.dist.label)};`);
  o.push(`  static const double distReveal = ${f(m.dist.reveal)};`);
  o.push(`  static const double distPage = ${f(m.dist.page)};`);
  o.push(`  static const double pressScale = ${f(m.dist.pressScale)};`);
  o.push(`  static const Duration staggerStep = Duration(milliseconds: ${m.stagger.step});`);
  o.push(`  static const Duration staggerMax = Duration(milliseconds: ${m.stagger.max});`);
  o.push(`  /// Hold to confirm length (zero: use an explicit confirmation step).`);
  o.push(`  static const Duration hold = Duration(milliseconds: ${m.hold});`);
  o.push('');
  o.push('  /// Per item delay that keeps the whole cascade under staggerMax.');
  o.push('  static Duration staggerFor(int count) {');
  o.push('    if (count <= 1) return Duration.zero;');
  o.push('    final capped = staggerMax.inMilliseconds ~/ (count - 1);');
  o.push('    return Duration(milliseconds: capped < staggerStep.inMilliseconds ? capped : staggerStep.inMilliseconds);');
  o.push('  }');
  o.push('');
  o.push('  /// Duration that respects reduced motion: pass MediaQuery.disableAnimationsOf(context).');
  o.push('  static Duration of(Duration d, {required bool reduce}) => reduce ? Duration.zero : d;');
  o.push('}');
  return o.join('\n') + '\n';
}

function emitSwift(m, name = 'MotionTokens') {
  const s2 = (n) => +(n / 1000).toFixed(3);
  const o = [];
  o.push(header(m, '//'));
  o.push('// SwiftUI, iOS 17+ / macOS 14+ (spring(duration:bounce:) and sensoryFeedback).');
  o.push('import SwiftUI');
  o.push('');
  o.push(`enum ${name} {`);
  o.push('    enum Duration {');
  for (const [k, n] of Object.entries(m.dur)) o.push(`        static let ${k}: TimeInterval = ${s2(n)}`);
  o.push('    }');
  o.push('');
  o.push('    enum Ease {');
  for (const [k, c] of Object.entries(m.ease)) o.push(`        static func ${k === 'in' ? '`in`' : k}(_ duration: TimeInterval = Duration.fast) -> Animation { .timingCurve(${c.join(', ')}, duration: duration) }`);
  o.push('    }');
  o.push('');
  o.push('    enum Springs {');
  for (const [k, s] of Object.entries(m.springs)) o.push(`        /// visual ${s.visualMs} ms, bounce ${s.bounce}\n        static let ${k}: Animation = .spring(duration: ${s2(s.visualMs)}, bounce: ${s.bounce})`);
  o.push('    }');
  o.push('');
  o.push('    enum Distance {');
  o.push(`        static let label: CGFloat = ${m.dist.label}`);
  o.push(`        static let reveal: CGFloat = ${m.dist.reveal}`);
  o.push(`        static let page: CGFloat = ${m.dist.page}`);
  o.push(`        static let pressScale: CGFloat = ${m.dist.pressScale}`);
  o.push('    }');
  o.push('');
  o.push(`    static let staggerStep: TimeInterval = ${s2(m.stagger.step)}`);
  o.push(`    static let staggerMax: TimeInterval = ${s2(m.stagger.max)}`);
  o.push(`    /// Hold to confirm length in seconds (0: use an explicit confirmation step).`);
  o.push(`    static let hold: TimeInterval = ${s2(m.hold)}`);
  o.push('');
  o.push('    static func stagger(_ index: Int, count: Int) -> TimeInterval {');
  o.push('        guard count > 1 else { return 0 }');
  o.push('        return Double(index) * min(staggerStep, staggerMax / Double(count - 1))');
  o.push('    }');
  o.push('');
  o.push('    /// Use with @Environment(\\.accessibilityReduceMotion): movement becomes a short crossfade.');
  o.push('    static func animation(_ a: Animation, reduce: Bool) -> Animation { reduce ? .easeInOut(duration: Duration.quick) : a }');
  o.push('}');
  return o.join('\n') + '\n';
}

function emitKotlin(m, name = 'MotionTokens') {
  const o = [];
  o.push(header(m, '//'));
  o.push('// Jetpack Compose (androidx.compose.animation.core). Springs keep velocity on interruption.');
  o.push('package design.motion');
  o.push('');
  o.push('import androidx.compose.animation.core.CubicBezierEasing');
  o.push('import androidx.compose.animation.core.SpringSpec');
  o.push('import androidx.compose.animation.core.spring');
  o.push('import androidx.compose.ui.unit.dp');
  o.push('');
  o.push(`object ${name} {`);
  o.push('    object Duration {');
  for (const [k, n] of Object.entries(m.dur)) o.push(`        const val ${SCREAM(k)} = ${n}`);
  o.push('    }');
  o.push('');
  o.push('    object Easing {');
  for (const [k, c] of Object.entries(m.ease)) o.push(`        val ${cap(k)} = CubicBezierEasing(${c.map((x) => `${x}f`).join(', ')})`);
  o.push('    }');
  o.push('');
  o.push('    object Springs {');
  for (const [k, s] of Object.entries(m.springs)) {
    o.push(`        /** visual ${s.visualMs} ms, bounce ${s.bounce}, settles in about ${s.settleMs} ms */`);
    o.push(`        fun <T> ${k}(): SpringSpec<T> = spring(dampingRatio = ${s.ratio}f, stiffness = ${s.stiffness}f)`);
  }
  o.push('    }');
  o.push('');
  o.push('    object Distance {');
  o.push(`        val Label = ${m.dist.label}.dp`);
  o.push(`        val Reveal = ${m.dist.reveal}.dp`);
  o.push(`        val Page = ${m.dist.page}.dp`);
  o.push(`        const val PRESS_SCALE = ${m.dist.pressScale}f`);
  o.push('    }');
  o.push('');
  o.push(`    const val STAGGER_STEP = ${m.stagger.step}`);
  o.push(`    const val STAGGER_MAX = ${m.stagger.max}`);
  o.push(`    /** Hold to confirm length in ms (0: use an explicit confirmation step). */`);
  o.push(`    const val HOLD = ${m.hold}`);
  o.push('');
  o.push('    fun staggerFor(count: Int): Int = if (count <= 1) 0 else minOf(STAGGER_STEP, STAGGER_MAX / (count - 1))');
  o.push('}');
  return o.join('\n') + '\n';
}

function emitJson(m) {
  return JSON.stringify(m, null, 2) + '\n';
}

const EMITTERS = {
  css: { file: 'motion-tokens.css', fn: (m, a) => emitCss(m, a.prefix) },
  ts: { file: 'motion-tokens.ts', fn: (m, a) => emitTs(m, a.name) },
  dart: { file: 'motion_tokens.dart', fn: (m, a) => emitDart(m, a.name) },
  swift: { file: 'MotionTokens.swift', fn: (m, a) => emitSwift(m, a.name) },
  kotlin: { file: 'MotionTokens.kt', fn: (m, a) => emitKotlin(m, a.name) },
  json: { file: 'motion-tokens.json', fn: (m) => emitJson(m) },
};

// ─── Main ──────────────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split(/\r?\n/).filter((l) => l.startsWith('//')).slice(0, 30).join('\n'));
    return;
  }
  if (args.list) {
    const w = Math.max(...Object.keys(PRESETS).map((k) => k.length));
    for (const [id, p] of Object.entries(PRESETS)) console.log(`${id.padEnd(w)}  ${p.summary}`);
    return;
  }
  let preset;
  let id = args.preset ?? 'neutral';
  if (args.custom) {
    const custom = JSON.parse(readFileSync(resolve(args.custom), 'utf8').replace(/^﻿/, ''));
    id = custom.id ?? custom.extends ?? id;
    const parent = PRESETS[custom.extends ?? args.preset ?? 'neutral'];
    if (!parent) throw new Error(`Unknown preset to extend: ${custom.extends}`);
    preset = deepMerge(structuredClone(parent), custom);
    preset.label = custom.label ?? `${parent.label} (custom)`;
  } else {
    if (!PRESETS[id]) {
      console.error(`Unknown preset "${id}". Run --list.`);
      process.exit(2);
    }
    preset = structuredClone(PRESETS[id]);
  }
  for (const s of args.set) {
    const eq = s.indexOf('=');
    const path = s.slice(0, eq).replace(/\.duration$/, '.d').replace(/\.bounce$/, '.b');
    setPath(preset, path, s.slice(eq + 1));
  }
  preset.id = id;
  delete preset.extends;
  const model = build(preset);

  const format = args.format ?? 'css';
  const formats = format === 'all' ? Object.keys(EMITTERS) : format.split(',');
  for (const fm of formats) if (!EMITTERS[fm]) { console.error(`Unknown format "${fm}"`); process.exit(2); }
  if (formats.length > 1 && !args.out) { console.error('Use --out <dir> with more than one format.'); process.exit(2); }

  if (args.out) {
    mkdirSync(resolve(args.out), { recursive: true });
    for (const fm of formats) {
      const p = join(resolve(args.out), EMITTERS[fm].file);
      writeFileSync(p, EMITTERS[fm].fn(model, args));
      console.log(`wrote ${p}`);
    }
  } else {
    process.stdout.write(EMITTERS[formats[0]].fn(model, args));
  }
}

main();
