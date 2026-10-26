// Adapted from AbubakrChan/product-launch-motion (MIT, Copyright (c) 2026 Abubakr Chan), references/technique.md.
// Changes: made stepR, Track, vis and the edge-split helper a standalone ES module with no DOM or engine
// dependency; added input checks, clamp, a CLI table printer and fromDurationBounce() (the duration and
// bounce to stiffness mapping, from Omar-Tnzxo/motion-interaction-studio, same owner as this repo);
// removed private paths; replaced dash characters; the main-module check compares the resolved script path
// (fileURLToPath, case-insensitive on Windows) instead of a file-name suffix, and --help prints the usage.
//
// Closed-form springs are a pure function of time: any frame can be rendered in any order, so they are
// seek-safe in every engine. Stateful spring integrators (interaction-library solvers that step a velocity)
// are not, and must not be used in renders.
//
// Usage (Node 18+, any OS):
//   node springs.mjs                    prints step responses for the common damping values
//   node springs.mjs 14 0.82 1.2        prints the response of w=14, z=0.82 over 1.2 s
// Import:
//   import { stepR, Track, vis, edgeSplit, fromDurationBounce } from './springs.mjs';

import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// Damped step response from 0 to 1. tau = seconds since the target changed, w = natural frequency (rad/s),
// z = damping ratio (1 = critically damped, no overshoot; below 1 overshoots).
export function stepR(tau, { w, z }) {
  if (!(w > 0) || !(z > 0)) throw new Error('stepR needs w > 0 and z > 0');
  if (tau <= 0) return 0;
  if (z >= 1) {
    const x = w * tau;
    return 1 - Math.exp(-x) * (1 + x);
  }
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + ((z * w) / wd) * Math.sin(wd * tau));
}

// A value that changes target many times = the sum of one spring per change. Still a pure function of t.
export class Track {
  constructor(v0) {
    this.v0 = v0;
    this.cur = v0;
    this.ev = [];
  }
  to(t, v, sp) {
    if (v !== this.cur) {
      this.ev.push([t, v - this.cur, sp]);
      this.cur = v;
    }
    return this;
  }
  at(t) {
    let v = this.v0;
    for (const [ti, d, sp] of this.ev) v += d * stepR(t - ti, sp);
    return v;
  }
}

// Content swap with blur: enter on a spring, exit short and early. Returns opacity o, blur b (px), y offset dy (px).
// tin = enter time, tout = exit start (or null), dOut = exit length in seconds.
export function vis(t, tin, tout = null, dOut = 0.12) {
  const e = stepR(t - tin, { w: 26, z: 1 });
  const x = tout == null ? 0 : clamp((t - tout) / dOut);
  const xo = x * x;
  return { o: e * (1 - xo), b: (1 - e) * 10 + xo * 10, dy: (1 - e) * 16 - xo * 10, e };
}

// Edge-split stretch (toggle knob, tab indicator, liquid pill): the leading edge rides a stiff spring and the
// trailing edge a soft one, so the shape stretches while it travels. width = right - left.
export function edgeSplit(fromLeft, fromRight, toLeft, toRight, tStart, lead = { w: 34, z: 0.9 }, trail = { w: 19, z: 0.9 }) {
  const movingRight = toLeft > fromLeft;
  const left = new Track(fromLeft).to(tStart, toLeft, movingRight ? trail : lead);
  const right = new Track(fromRight).to(tStart, toRight, movingRight ? lead : trail);
  return (t) => {
    const l = left.at(t);
    const r = right.at(t);
    return { left: l, right: r, width: r - l };
  };
}

// Author a spring as visual duration (seconds) and bounce (0 = none, 0.15 crisp, 0.3 visible, above 0.4 reads cheap).
// stiffness = (2 * PI / duration)^2, dampingRatio = 1 - bounce. Returns { w, z } for stepR plus physics values.
export function fromDurationBounce(durationS, bounce = 0) {
  if (!(durationS > 0)) throw new Error('duration must be > 0 seconds');
  if (bounce < 0 || bounce >= 1) throw new Error('bounce must be in [0, 1)');
  const stiffness = Math.pow((2 * Math.PI) / durationS, 2);
  const z = 1 - bounce;
  const w = Math.sqrt(stiffness); // mass 1
  return { w, z, stiffness, damping: 2 * z * Math.sqrt(stiffness), mass: 1 };
}

// Time until the response stays within tol of 1 (scanned at 1 ms, up to maxS seconds).
export function settleTime({ w, z }, tol = 0.01, maxS = 10) {
  let last = 0;
  for (let i = 0; i <= maxS * 1000; i++) {
    const t = i / 1000;
    if (Math.abs(stepR(t, { w, z }) - 1) > tol) last = t;
  }
  return last;
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

if (isMain && ['--help', '-h'].includes(process.argv[2])) {
  console.log('Usage:\n  node springs.mjs                 step responses for the common damping values\n  node springs.mjs <w> <z> [span]  response of natural frequency w (rad/s) and damping z over span seconds (default 1)');
} else if (isMain) {
  const [w, z, span] = process.argv.slice(2).map(Number);
  if (w && z) {
    const end = span || 1;
    for (let i = 0; i <= 20; i++) {
      const t = (end * i) / 20;
      console.log(`${t.toFixed(3)}s\t${stepR(t, { w, z }).toFixed(4)}`);
    }
    console.log(`settle (1%): ${settleTime({ w, z }).toFixed(3)} s`);
  } else {
    console.log('w\tz\tpeak\tsettle(1%)');
    for (const sp of [
      { w: 14, z: 1 },
      { w: 14, z: 0.9 },
      { w: 14, z: 0.82 },
      { w: 14, z: 0.72 },
      { w: 26, z: 1 },
      { w: 8, z: 1 },
    ]) {
      let peak = 0;
      for (let i = 0; i <= 3000; i++) peak = Math.max(peak, stepR(i / 1000, sp));
      console.log(`${sp.w}\t${sp.z}\t${peak.toFixed(3)}\t${settleTime(sp).toFixed(3)} s`);
    }
  }
}
