# From Vincentwei1021/mg-styles-15 (MIT). Changes: njit comes from _deps (a no-op when numba is missing); numpy and plain-Python fallbacks for the hot kernels appended at the end.
"""DSP kernels (sample-accurate loops), JIT-compiled by numba when installed. All take/return float64 arrays."""
import numpy as np
from ._deps import njit, HAVE as _HAVE

SR = 48000.0
TWO_PI = 2.0 * np.pi


# ============================================================================ oscillators
@njit(cache=True, inline='always')
def _blep(t, dt):
    if t < dt:
        t = t / dt
        return t + t - t * t - 1.0
    elif t > 1.0 - dt:
        t = (t - 1.0) / dt
        return t * t + t + t + 1.0
    return 0.0


@njit(cache=True)
def osc_saw(freq, phase0, sr):
    n = freq.shape[0]
    out = np.empty(n)
    ph = phase0
    for i in range(n):
        dt = freq[i] / sr
        if dt < 1e-9:
            dt = 1e-9
        if dt > 0.45:
            dt = 0.45
        out[i] = 2.0 * ph - 1.0 - _blep(ph, dt)
        ph += dt
        while ph >= 1.0:
            ph -= 1.0
    return out


@njit(cache=True)
def osc_pulse(freq, pw, phase0, sr, remove_dc):
    """Band-limited pulse. pw array (0..1) duty cycle."""
    n = freq.shape[0]
    out = np.empty(n)
    ph = phase0
    for i in range(n):
        dt = freq[i] / sr
        if dt < 1e-9:
            dt = 1e-9
        if dt > 0.45:
            dt = 0.45
        w = pw[i]
        if w < 0.01:
            w = 0.01
        if w > 0.99:
            w = 0.99
        v = 1.0 if ph < w else -1.0
        v += _blep(ph, dt)
        t2 = ph - w
        if t2 < 0.0:
            t2 += 1.0
        v -= _blep(t2, dt)
        if remove_dc:
            v -= (2.0 * w - 1.0)
        out[i] = v
        ph += dt
        while ph >= 1.0:
            ph -= 1.0
    return out


@njit(cache=True)
def osc_tri(freq, phase0, sr):
    """Band-limited triangle by leaky integration of a BLEP square."""
    n = freq.shape[0]
    out = np.empty(n)
    ph = phase0
    acc = 0.0
    # start the integrator at the correct value for phase0
    if ph < 0.5:
        acc = -1.0 + 4.0 * ph
    else:
        acc = 3.0 - 4.0 * ph
    leak = 1.0 - 2.0 * np.pi * 3.0 / sr
    for i in range(n):
        dt = freq[i] / sr
        if dt < 1e-9:
            dt = 1e-9
        if dt > 0.45:
            dt = 0.45
        v = 1.0 if ph < 0.5 else -1.0
        v += _blep(ph, dt)
        t2 = ph - 0.5
        if t2 < 0.0:
            t2 += 1.0
        v -= _blep(t2, dt)
        acc = acc * leak + 4.0 * dt * v
        out[i] = acc
        ph += dt
        while ph >= 1.0:
            ph -= 1.0
    return out


# ============================================================================ filters
@njit(cache=True)
def svf(x, fc, q, mode, sr):
    """TPT state-variable filter with per-sample cutoff/Q.
    mode: 0 LP, 1 BP (constant skirt), 2 HP, 3 notch, 4 BP normalised (unity peak), 5 allpass"""
    n = x.shape[0]
    y = np.empty(n)
    ic1 = 0.0
    ic2 = 0.0
    for i in range(n):
        f = fc[i]
        if f < 5.0:
            f = 5.0
        if f > sr * 0.49:
            f = sr * 0.49
        g = np.tan(np.pi * f / sr)
        qq = q[i]
        if qq < 0.05:
            qq = 0.05
        k = 1.0 / qq
        a1 = 1.0 / (1.0 + g * (g + k))
        a2 = g * a1
        a3 = g * a2
        v0 = x[i]
        v3 = v0 - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2.0 * v1 - ic1
        ic2 = 2.0 * v2 - ic2
        if mode == 0:
            y[i] = v2
        elif mode == 1:
            y[i] = v1
        elif mode == 2:
            y[i] = v0 - k * v1 - v2
        elif mode == 3:
            y[i] = v0 - k * v1
        elif mode == 4:
            y[i] = k * v1
        else:
            y[i] = v0 - 2.0 * k * v1
    return y


@njit(cache=True)
def ladder(x, fc, res, drive, sr, comp):
    """4-pole TPT ladder (Moog-style) with tanh on the feedback-solved input.
    res 0..1 (1 ~ self-oscillation), drive >=1 saturates, comp = bass-loss compensation 0..1"""
    n = x.shape[0]
    y = np.empty(n)
    s1 = 0.0
    s2 = 0.0
    s3 = 0.0
    s4 = 0.0
    for i in range(n):
        f = fc[i]
        if f < 10.0:
            f = 10.0
        if f > sr * 0.45:
            f = sr * 0.45
        g = np.tan(np.pi * f / sr)
        G = g / (1.0 + g)
        k = 4.0 * res[i]
        S = (G * G * G * s1 + G * G * s2 + G * s3 + s4) / (1.0 + g)
        xin = x[i] * (1.0 + comp * k)
        u = (xin - k * S) / (1.0 + k * G * G * G * G)
        u = np.tanh(u * drive) / drive
        v = (u - s1) * G
        y1 = v + s1
        s1 = y1 + v
        v = (y1 - s2) * G
        y2 = v + s2
        s2 = y2 + v
        v = (y2 - s3) * G
        y3 = v + s3
        s3 = y3 + v
        v = (y3 - s4) * G
        y4 = v + s4
        s4 = y4 + v
        y[i] = y4
    return y


@njit(cache=True)
def onepole_lp(x, fc, sr):
    n = x.shape[0]
    y = np.empty(n)
    s = x[0] if n > 0 else 0.0
    for i in range(n):
        f = fc[i]
        if f < 0.01:
            f = 0.01
        if f > sr * 0.49:
            f = sr * 0.49
        g = np.tan(np.pi * f / sr)
        G = g / (1.0 + g)
        v = (x[i] - s) * G
        yy = v + s
        s = yy + v
        y[i] = yy
    return y


@njit(cache=True)
def env_follow(x, att, rel, sr):
    """Peak envelope follower (x should be >=0). att/rel in seconds."""
    n = x.shape[0]
    y = np.empty(n)
    a = np.exp(-1.0 / (att * sr + 1e-9))
    r = np.exp(-1.0 / (rel * sr + 1e-9))
    e = 0.0
    for i in range(n):
        v = x[i]
        if v > e:
            e = a * e + (1.0 - a) * v
        else:
            e = r * e + (1.0 - r) * v
        y[i] = e
    return y


@njit(cache=True)
def compressor_gain(det_db, thr, ratio, knee, att, rel, sr):
    """Gain reduction (dB, <=0) from a detector level in dB. Soft knee, smoothed in dB domain."""
    n = det_db.shape[0]
    out = np.empty(n)
    a = np.exp(-1.0 / (att * sr + 1e-9))
    r = np.exp(-1.0 / (rel * sr + 1e-9))
    g = 0.0
    slope = 1.0 - 1.0 / ratio
    for i in range(n):
        over = det_db[i] - thr
        if knee > 0.0 and over > -knee / 2 and over < knee / 2:
            tgt = -slope * (over + knee / 2) ** 2 / (2.0 * knee)
        elif over >= knee / 2:
            tgt = -slope * over
        else:
            tgt = 0.0
        if tgt < g:
            g = a * g + (1.0 - a) * tgt
        else:
            g = r * g + (1.0 - r) * tgt
        out[i] = g
    return out


@njit(cache=True)
def limiter_smooth(greq, att_n, rel_coef):
    """Given required gain (<=1) per sample, produce smooth gain <= greq:
    forward release pass + backward attack pass."""
    n = greq.shape[0]
    g = np.empty(n)
    cur = 1.0
    for i in range(n):
        v = greq[i]
        nxt = cur + (1.0 - cur) * rel_coef
        if v < nxt:
            cur = v
        else:
            cur = nxt
        g[i] = cur
    # backward attack
    a = np.exp(-1.0 / max(att_n, 1.0))
    cur = 1.0
    for i in range(n - 1, -1, -1):
        v = g[i]
        nxt = cur + (1.0 - cur) * (1.0 - a)
        if v < nxt:
            cur = v
        else:
            cur = nxt
        g[i] = cur
    return g


# ============================================================================ delays / modulation
@njit(cache=True, inline='always')
def _hermite(buf, L, pos):
    """4-point cubic hermite read from circular buffer at fractional position (absolute index)."""
    i = int(np.floor(pos))
    f = pos - i
    xm1 = buf[(i - 1) % L]
    x0 = buf[i % L]
    x1 = buf[(i + 1) % L]
    x2 = buf[(i + 2) % L]
    c0 = x0
    c1 = 0.5 * (x1 - xm1)
    c2 = xm1 - 2.5 * x0 + 2.0 * x1 - 0.5 * x2
    c3 = 0.5 * (x2 - xm1) + 1.5 * (x0 - x1)
    return ((c3 * f + c2) * f + c1) * f + c0


@njit(cache=True)
def moddelay(x, delay_samps, feedback, mix):
    """Modulated fractional delay line. delay_samps: per-sample delay (>=1). Returns wet/dry mix."""
    n = x.shape[0]
    L = 1
    mx = 0.0
    for i in range(n):
        if delay_samps[i] > mx:
            mx = delay_samps[i]
    while L < int(mx) + 8:
        L *= 2
    buf = np.zeros(L)
    y = np.empty(n)
    fb = 0.0
    for i in range(n):
        buf[i % L] = x[i] + fb * feedback
        d = delay_samps[i]
        if d < 1.0:
            d = 1.0
        pos = i - d
        if pos < 0:
            w = 0.0
        else:
            w = _hermite(buf, L, pos)
        fb = w
        y[i] = x[i] * (1.0 - mix) + w * mix
    return y


@njit(cache=True)
def varispeed(x, pos):
    """Read x at fractional positions pos (samples) with cubic interpolation; 0 outside."""
    n = pos.shape[0]
    m = x.shape[0]
    y = np.zeros(n)
    for j in range(n):
        p = pos[j]
        if p < 0.0 or p > m - 1:
            continue
        i = int(np.floor(p))
        f = p - i
        xm1 = x[i - 1] if i - 1 >= 0 else 0.0
        x0 = x[i]
        x1 = x[i + 1] if i + 1 < m else 0.0
        x2 = x[i + 2] if i + 2 < m else 0.0
        c1 = 0.5 * (x1 - xm1)
        c2 = xm1 - 2.5 * x0 + 2.0 * x1 - 0.5 * x2
        c3 = 0.5 * (x2 - xm1) + 1.5 * (x0 - x1)
        y[j] = ((c3 * f + c2) * f + c1) * f + x0
    return y


@njit(cache=True)
def pingpong(xl, xr, dl, dr, fb, cross, lp_hz, hp_hz, sat, sr):
    """Stereo feedback delay with filtering in the loop. dl/dr in samples (constant).
    cross = 1 -> full ping-pong. Returns wet L,R."""
    n = xl.shape[0]
    L = 1
    while L < int(max(dl, dr)) + 8:
        L *= 2
    bl = np.zeros(L)
    br = np.zeros(L)
    yl = np.empty(n)
    yr = np.empty(n)
    gl = np.tan(np.pi * lp_hz / sr)
    Gl = gl / (1 + gl)
    gh = np.tan(np.pi * hp_hz / sr)
    Gh = gh / (1 + gh)
    sl1 = 0.0
    sr1 = 0.0
    sl2 = 0.0
    sr2 = 0.0
    for i in range(n):
        pl = i - dl
        pr = i - dr
        wl = _hermite(bl, L, pl) if pl >= 0 else 0.0
        wr = _hermite(br, L, pr) if pr >= 0 else 0.0
        # loop filters (lp then hp) per channel
        v = (wl - sl1) * Gl
        lpl = v + sl1
        sl1 = lpl + v
        v = (wr - sr1) * Gl
        lpr = v + sr1
        sr1 = lpr + v
        v = (lpl - sl2) * Gh
        tl = v + sl2
        sl2 = tl + v
        hpl = lpl - tl
        v = (lpr - sr2) * Gh
        tr = v + sr2
        sr2 = tr + v
        hpr = lpr - tr
        if sat > 0:
            hpl = np.tanh(hpl * (1 + sat)) / (1 + sat)
            hpr = np.tanh(hpr * (1 + sat)) / (1 + sat)
        fl = fb * ((1 - cross) * hpl + cross * hpr)
        frr = fb * ((1 - cross) * hpr + cross * hpl)
        bl[i % L] = xl[i] + fl
        br[i % L] = xr[i] + frr
        yl[i] = wl
        yr[i] = wr
    return yl, yr


# ============================================================================ physical models
@njit(cache=True)
def karplus(exc, freq, decay_t60, bright, disp, sr, pos_damp):
    """Extended Karplus-Strong string.
    exc: excitation (len n, zero-padded); freq: per-sample Hz (bends allowed);
    decay_t60: seconds for fundamental to decay 60 dB; bright 0..1 (loop LP);
    disp: 0..~0.6 allpass dispersion coefficient (stiffness); pos_damp: extra damping gain 0..1."""
    n = exc.shape[0]
    y = np.empty(n)
    L = 1
    fmin = 1e9
    for i in range(n):
        if freq[i] < fmin:
            fmin = freq[i]
    if fmin < 20.0:
        fmin = 20.0
    while L < int(sr / fmin) + 16:
        L *= 2
    buf = np.zeros(L)
    lp = 0.0
    ap_x1 = 0.0
    ap_y1 = 0.0
    # loop lowpass one-pole coefficient: y = (1-a) x + a y1
    a = 1.0 - bright
    if a < 0.0:
        a = 0.0
    if a > 0.95:
        a = 0.95
    for i in range(n):
        f = freq[i]
        if f < 20.0:
            f = 20.0
        # delay compensation: one-pole lp phase delay at f approx a/(1-a); allpass delay ~ (1-d)/(1+d)
        wdel = a / (1.0 - a + 1e-9)
        gd_lp = wdel / (1.0 + (2 * np.pi * f / sr) ** 2 * wdel * wdel)
        gd_ap = (1.0 + disp) / (1.0 - disp) if disp > 0 else 0.0
        D = sr / f - gd_lp - gd_ap
        if D < 2.0:
            D = 2.0
        # per-period gain for t60 at this f
        g = 10.0 ** (-3.0 / (decay_t60 * f)) * pos_damp
        pos = i - D
        if pos >= 1:
            r = _hermite(buf, L, pos)
        else:
            r = 0.0
        lp = (1.0 - a) * r + a * lp
        v = lp
        if disp > 0.0:
            # first-order allpass for dispersion
            apo = -disp * v + ap_x1 + disp * ap_y1
            ap_x1 = v
            ap_y1 = apo
            v = apo
        s = exc[i] + g * v
        buf[i % L] = s
        y[i] = s
    return y


@njit(cache=True)
def comb_resonator(x, freq, fb, damp, sr):
    """Feedback comb tuned to freq (per-sample), with damping LP in loop. For breathy tones."""
    n = x.shape[0]
    y = np.empty(n)
    L = 1
    fmin = 1e9
    for i in range(n):
        if freq[i] < fmin:
            fmin = freq[i]
    if fmin < 20:
        fmin = 20
    while L < int(sr / fmin) + 8:
        L *= 2
    buf = np.zeros(L)
    lp = 0.0
    for i in range(n):
        D = sr / max(freq[i], 20.0)
        pos = i - D
        r = _hermite(buf, L, pos) if pos >= 1 else 0.0
        lp = (1 - damp) * r + damp * lp
        s = x[i] + fb * lp
        buf[i % L] = s
        y[i] = s
    return y


@njit(cache=True)
def allpass_chain(x, coef, stages):
    """Cascade of identical first-order allpasses (spring / dispersive chirp)."""
    n = x.shape[0]
    y = x.copy()
    for s in range(stages):
        x1 = 0.0
        y1 = 0.0
        for i in range(n):
            v = y[i]
            o = -coef * v + x1 + coef * y1
            x1 = v
            y1 = o
            y[i] = o
    return y


@njit(cache=True)
def sample_hold(x, rate_hz, sr):
    """Sample & hold at rate (per-sample array) - for bitcrush/decimation style artefacts."""
    n = x.shape[0]
    y = np.empty(n)
    ph = 1.0
    v = 0.0
    for i in range(n):
        ph += rate_hz[i] / sr
        if ph >= 1.0:
            ph -= np.floor(ph)
            v = x[i]
        y[i] = v
    return y


@njit(cache=True)
def lfsr_noise(n, period_samps, short_mode, seed):
    """NES-style 15-bit LFSR noise; period_samps per-sample clock period (samples, float)."""
    y = np.empty(n)
    reg = seed & 0x7FFF
    if reg == 0:
        reg = 1
    acc = 0.0
    for i in range(n):
        acc += 1.0
        p = period_samps[i]
        if p < 0.05:
            p = 0.05
        while acc >= p:
            acc -= p
            tap = 6 if short_mode else 1
            fbit = (reg & 1) ^ ((reg >> tap) & 1)
            reg = (reg >> 1) | (fbit << 14)
        y[i] = 1.0 if (reg & 1) == 0 else -1.0
    return y


# ============================================================================ fallback mode (no numba)
# Same maths as the kernels above, rewritten so plain Python stays usable: oscillators and the triangle's
# leaky integrator are vectorised with numpy, the nonlinear filters loop over Python floats (math, lists),
# the delay line runs in blocks shorter than its smallest delay. Results match the kernels within float
# rounding (the oscillator phase is a cumulative sum instead of a running add).
def _blep_v(t, dt):
    out = np.zeros_like(t)
    lo = t < dt
    hi = (~lo) & (t > 1.0 - dt)
    a = t[lo] / dt[lo]
    out[lo] = a + a - a * a - 1.0
    b = (t[hi] - 1.0) / dt[hi]
    out[hi] = b * b + b + b + 1.0
    return out


def _phase_v(freq, phase0, sr):
    dt = np.clip(np.asarray(freq, np.float64) / sr, 1e-9, 0.45)
    acc = np.concatenate([[0.0], np.cumsum(dt[:-1])]) if dt.shape[0] else dt
    return np.mod(phase0 + acc, 1.0), dt


def _onepole_const(u, a, y0):
    """y[i] = a * y[i-1] + u[i] with y[-1] = y0, exact, in blocks short enough for a**-B to stay finite."""
    n = u.shape[0]
    y = np.empty(n)
    B = int(max(1, min(4096, 20.0 / max(1e-12, -np.log(a)))))
    pw = a ** -np.arange(B)
    prev = y0
    for s in range(0, n, B):
        e = min(n, s + B)
        p = pw[:e - s]
        y[s:e] = (a * prev + np.cumsum(u[s:e] * p)) / p
        prev = y[e - 1]
    return y


def _osc_saw_np(freq, phase0, sr):
    ph, dt = _phase_v(freq, phase0, sr)
    return 2.0 * ph - 1.0 - _blep_v(ph, dt)


def _osc_pulse_np(freq, pw, phase0, sr, remove_dc):
    ph, dt = _phase_v(freq, phase0, sr)
    w = np.clip(np.asarray(pw, np.float64), 0.01, 0.99)
    v = np.where(ph < w, 1.0, -1.0) + _blep_v(ph, dt) - _blep_v(np.mod(ph - w, 1.0), dt)
    return v - (2.0 * w - 1.0) if remove_dc else v


def _osc_tri_np(freq, phase0, sr):
    ph, dt = _phase_v(freq, phase0, sr)
    v = np.where(ph < 0.5, 1.0, -1.0) + _blep_v(ph, dt) - _blep_v(np.mod(ph - 0.5, 1.0), dt)
    acc0 = -1.0 + 4.0 * phase0 if phase0 < 0.5 else 3.0 - 4.0 * phase0
    return _onepole_const(4.0 * dt * v, 1.0 - 2.0 * np.pi * 3.0 / sr, acc0)


def _svf_py(x, fc, q, mode, sr):
    g = np.tan(np.pi * np.clip(fc, 5.0, sr * 0.49) / sr)
    k = 1.0 / np.maximum(q, 0.05)
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    xs, ks, A1, A2, A3 = x.tolist(), k.tolist(), a1.tolist(), a2.tolist(), a3.tolist()
    v1s, v2s = [0.0] * len(xs), [0.0] * len(xs)
    ic1 = ic2 = 0.0
    for i, v0 in enumerate(xs):
        a2i = A2[i]
        v3 = v0 - ic2
        v1 = A1[i] * ic1 + a2i * v3
        v2 = ic2 + a2i * ic1 + A3[i] * v3
        ic1 = 2.0 * v1 - ic1
        ic2 = 2.0 * v2 - ic2
        v1s[i] = v1
        v2s[i] = v2
    v1, v2 = np.array(v1s), np.array(v2s)
    return [v2, v1, x - k * v1 - v2, x - k * v1, k * v1, x - 2.0 * k * v1][min(int(mode), 5)]


def _ladder_py(x, fc, res, drive, sr, comp):
    import math
    g = np.tan(np.pi * np.clip(fc, 10.0, sr * 0.45) / sr)
    G = g / (1.0 + g)
    k = 4.0 * np.asarray(res, np.float64)
    xin = (x * (1.0 + comp * k)).tolist()
    Gs, gs, ks = G.tolist(), (1.0 / (1.0 + g)).tolist(), k.tolist()
    den = (1.0 / (1.0 + k * G ** 4)).tolist()
    tanh, d, inv_d = math.tanh, float(drive), 1.0 / float(drive)
    out = [0.0] * len(xin)
    s1 = s2 = s3 = s4 = 0.0
    for i, xi in enumerate(xin):
        Gi = Gs[i]
        S = (((Gi * s1 + s2) * Gi + s3) * Gi + s4) * gs[i]
        u = tanh((xi - ks[i] * S) * den[i] * d) * inv_d
        v = (u - s1) * Gi
        y1 = v + s1
        s1 = y1 + v
        v = (y1 - s2) * Gi
        y2 = v + s2
        s2 = y2 + v
        v = (y2 - s3) * Gi
        y3 = v + s3
        s3 = y3 + v
        v = (y3 - s4) * Gi
        y4 = v + s4
        s4 = y4 + v
        out[i] = y4
    return np.array(out)


def _hermite_v(buf, pos):
    i = np.floor(pos).astype(np.int64)
    f = pos - i
    m = buf.shape[0]

    def at(j):
        return np.where((j >= 0) & (j < m), buf[np.clip(j, 0, m - 1)], 0.0)
    xm1, x0, x1, x2 = at(i - 1), at(i), at(i + 1), at(i + 2)
    c1 = 0.5 * (x1 - xm1)
    c2 = xm1 - 2.5 * x0 + 2.0 * x1 - 0.5 * x2
    c3 = 0.5 * (x2 - xm1) + 1.5 * (x0 - x1)
    return ((c3 * f + c2) * f + c1) * f + x0


def _moddelay_np(x, delay_samps, feedback, mix):
    n = x.shape[0]
    d = np.maximum(np.asarray(delay_samps, np.float64), 1.0)
    B = int(np.floor(d.min())) - 3 if n else 1
    if B < 1:
        return _moddelay_kernel(x, delay_samps, feedback, mix)
    pos = np.arange(n) - d
    buf = np.zeros(n)
    w = np.zeros(n)
    prev = 0.0
    for s in range(0, n, B):
        e = min(n, s + B)
        p = pos[s:e]
        w[s:e] = np.where(p < 0, 0.0, _hermite_v(buf, p))
        fbk = np.concatenate([[prev], w[s:e - 1]])
        buf[s:e] = x[s:e] + fbk * feedback
        prev = w[e - 1]
    return x * (1.0 - mix) + w * mix


_moddelay_kernel = moddelay   # per-sample loop, used when a delay is shorter than 4 samples
if not _HAVE['numba']:
    osc_saw, osc_pulse, osc_tri = _osc_saw_np, _osc_pulse_np, _osc_tri_np
    svf, ladder, moddelay = _svf_py, _ladder_py, _moddelay_np
