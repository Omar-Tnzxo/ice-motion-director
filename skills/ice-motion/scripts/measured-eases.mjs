// Adapted from Tejashmakwana/motionmaxxing (Apache-2.0), runtime/motion.js and references/motion.md.
// Changes: extracted the 12 measured ease functions from the runtime into a standalone ES module,
// added the shape and usage table as data, added sample(), shape(), nearest() and a CLI table printer,
// removed the GSAP dependency, replaced dash characters; the main-module check uses fileURLToPath (works on
// Windows drive letters and spaces) and --help prints the usage.
//
// The 12 eases were fitted to the median curves of clusters of 4,288 moves measured frame by frame on
// 53 human-made launch moments (SaaS genre, 3-7 s moments). They are anchors on a continuum: interpolate
// between them. Every function maps t in [0, 1] to progress with f(0) = 0 and f(1) = 1 (overshooting
// eases pass 1 on the way).
//
// Usage (Node 18+, any OS):
//   node measured-eases.mjs                 prints the shape table of all 12 eases
//   node measured-eases.mjs softLand 11     prints 11 evenly spaced samples of one ease
// Import:
//   import { EASE, EASE_INFO, sample } from './measured-eases.mjs';

import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const powerOut = (p) => (t) => 1 - Math.pow(1 - t, p);
const powerIn = (p) => (t) => Math.pow(t, p);
const expoOut = (k) => {
  const d = 1 - Math.exp(-k);
  return (t) => (1 - Math.exp(-k * t)) / d;
};
const snapRamp = (w, tau) => {
  const n = w * (1 - Math.exp(-1 / tau)) + (1 - w);
  return (t) => (w * (1 - Math.exp(-t / tau)) + (1 - w) * t) / n;
};
const snapOver = (A, ta, td) => {
  const f = (t) => (1 + A * Math.exp(-t / td)) * (1 - Math.exp(-t / ta));
  const n = f(1);
  return (t) => f(t) / n;
};
const spring = (c, om) => {
  const f = (t) => 1 - Math.exp(-c * t) * (Math.cos(om * t) + (c / om) * Math.sin(om * t));
  const n = f(1);
  return (t) => f(t) / n;
};
const smoothP = (p) => (t) => {
  const a = Math.pow(t, p);
  const b = Math.pow(1 - t, p);
  return a / (a + b);
};
const guard = (f) => (t) => (t <= 0 ? 0 : t >= 1 ? 1 : f(t));

export const EASE = Object.freeze({
  crashIn: guard(snapOver(2.0, 0.19, 0.218)), // touches and passes the mark at once (peak 1.18 at t ~0.27)
  popOver: guard(spring(2.67, 4.36)), // slow late overshoot (peak 1.08 at t ~0.72)
  bounceHard: guard(spring(1.34, 5.07)), // big overshoot (peak 1.48 at t ~0.62), use sparingly
  snapSettle: guard(snapRamp(0.942, 0.118)), // hero entry: 54% of travel in the first 10% of the time
  softLand: guard(expoOut(3.41)), // firm decelerate, the workhorse for text and panels
  whip: guard(powerOut(2.52)), // hard decelerating big move
  glide: guard(powerOut(1.7)), // gentle ease-out for medium moves
  cruise: guard((t) => t), // linear: fades, drifts, counters
  softInOut: guard(smoothP(1.42)), // symmetric S for opacity and blur
  gentleIn: guard(powerIn(2.07)), // mild acceleration
  accelExit: guard(powerIn(2.6)), // the leaving curve
  crashOut: guard(powerIn(3.97)), // hard acceleration into a cut
});

// Measured frames at 30 fps (p25 / median / p75), share of 3,573 distinct moves, and what humans used it for.
export const EASE_INFO = Object.freeze({
  cruise: { frames30: [6, 9, 16], share: '18%', use: 'fades, drift, camera creep, counters, ambient motion; every drift is linear' },
  glide: { frames30: [7, 10, 18], share: '14%', use: 'all-purpose medium x/y/scale/blur lands; entries and exits alike' },
  softInOut: { frames30: [6, 9, 16], share: '14%', use: 'opacity, blur, counters off a handle, ground and colour ramps' },
  softLand: { frames30: [6, 12, 21], share: '9%', use: 'text rises, panel slides, scale-ins; 85% are entries' },
  gentleIn: { frames30: [6, 9, 17], share: '9%', use: 'exits, blur-out and fade-out starts, slow push-ins running into a cut' },
  snapSettle: { frames30: [6, 11, 29], share: '6%', use: 'hero entries; 23% of CTA moves; 79% are entries' },
  whip: { frames30: [8, 13, 21], share: '6%', use: 'big fast moves; true whips median 7-8 frames' },
  accelExit: { frames30: [9, 13, 19], share: '5%', use: 'the leaving curve: scale exits, pans off-frame, peak speed at t ~0.9' },
  crashOut: { frames30: [11, 17, 31], share: '4%', use: 'camera pull-offs and exits that end in a hard cut at full speed' },
  popOver: { frames30: [11, 15, 27], share: '2%', use: 'the late lean past the mark; one physical reward per film' },
  crashIn: { frames30: [9, 10, 27], share: '1%', use: 'slams that touch the mark almost at once, pass it, relax back by t 0.9' },
  bounceHard: { frames30: [11, 22, 28], share: '<1%', use: 'the big overshoot; at most once per film' },
});

// Sample an ease into n evenly spaced values (n >= 2).
export function sample(name, n = 11) {
  const f = EASE[name];
  if (!f) throw new Error(`Unknown ease "${name}". Known: ${Object.keys(EASE).join(', ')}`);
  if (!Number.isInteger(n) || n < 2) throw new Error('n must be an integer >= 2');
  return Array.from({ length: n }, (_, i) => f(i / (n - 1)));
}

// Percent of travel done at 10 / 25 / 50 / 75 % of the time (the shape fingerprint used to match a measured move).
export function shape(name) {
  const f = EASE[name];
  if (!f) throw new Error(`Unknown ease "${name}"`);
  return [0.1, 0.25, 0.5, 0.75].map((t) => Math.round(f(t) * 100));
}

// Find the measured ease whose shape is nearest to a measured move, given progress at 10/25/50/75 % of its time (0-1 values).
export function nearest(p10, p25, p50, p75) {
  const target = [p10, p25, p50, p75];
  let best = null;
  for (const name of Object.keys(EASE)) {
    const s = [0.1, 0.25, 0.5, 0.75].map((t) => EASE[name](t));
    const err = Math.sqrt(s.reduce((acc, v, i) => acc + (v - target[i]) ** 2, 0) / 4);
    if (!best || err < best.err) best = { name, err };
  }
  return best;
}

const isMain = (() => {
  try {
    if (!process.argv[1]) return false;
    const self = realpathSync(fileURLToPath(import.meta.url));
    const arg = realpathSync(resolve(process.argv[1]));
    return process.platform === 'win32' ? self.toLowerCase() === arg.toLowerCase() : self === arg;
  } catch {
    return false;
  }
})();

if (isMain) {
  const [name, n] = process.argv.slice(2);
  if (name === '--help' || name === '-h') {
    console.log('Usage:\n  node measured-eases.mjs              shape table of all 12 eases\n  node measured-eases.mjs <ease> [n]   n evenly spaced samples of one ease (default 11)');
  } else if (name) {
    const values = sample(name, n ? Number(n) : 11);
    console.log(values.map((v, i) => `${(i / (values.length - 1)).toFixed(2)}\t${v.toFixed(4)}`).join('\n'));
  } else {
    console.log('ease\t\t% at 10/25/50/75\tframes@30 p25/med/p75\tshare\tuse');
    for (const key of Object.keys(EASE)) {
      const info = EASE_INFO[key];
      console.log(`${key.padEnd(12)}\t${shape(key).join('/').padEnd(16)}\t${info.frames30.join('/').padEnd(16)}\t${info.share}\t${info.use}`);
    }
  }
}
