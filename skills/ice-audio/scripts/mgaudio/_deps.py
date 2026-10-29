# Part of Ice Motion Director (Apache-2.0), written for the ice-audio skill by Omar-Tnzxo.
"""Optional packages, their numpy-only fallbacks and clear errors. Exact pins: the ice-audio skill's
scripts/requirements.txt.

Two modes, chosen once at import:
- fast path: numpy plus numba, scipy, soundfile and pyloudnorm installed. Kernels are JIT-compiled.
- fallback mode: only numpy is required. Every missing package is replaced here: numba by plain Python
  loops (same kernels, slower), scipy by numpy versions of the few functions mgaudio uses (FFT based),
  soundfile by the standard library `wave` module (PCM 16, 24 or 32 bit WAV), pyloudnorm by a numpy
  ITU-R BS.1770-4 meter. Output is valid and deterministic, but not bit-identical to the fast path.
Set MGAUDIO_FALLBACK=1 to force fallback mode even when the packages are installed (for tests).

This module installs nothing itself; the messages tell the agent what to install (free pinned packages need no question: ice-engines engine-choice.md section 7.6).
"""
from __future__ import annotations

import importlib
import importlib.util
import math
import os
import sys

PINS = {
    'numpy': 'numpy==2.4.6',
    'scipy': 'scipy==1.16.3',
    'soundfile': 'soundfile==0.14.0',
    'numba': 'numba==0.66.0',
    'pedalboard': 'pedalboard==0.9.26',
    'pyloudnorm': 'pyloudnorm==0.2.0',
    'matplotlib': 'matplotlib==3.10.9',
    'librosa': 'librosa==0.11.0',
}
# The only hard requirement. The fast-path packages below are used when present, replaced when absent.
CORE = ('numpy',)
FAST = ('numba', 'scipy', 'soundfile', 'pyloudnorm')
FORCED = os.environ.get('MGAUDIO_FALLBACK', '').strip() not in ('', '0')


def missing_message(names, what='mgaudio'):
    pins = ' '.join(PINS[n] for n in names)
    return (f"{what} needs {' and '.join(PINS[n] for n in names)}. Install into a project virtual environment "
            f"(no question needed, ice-engines engine-choice.md section 7.6): python -m pip install -r <the ice-audio skill's scripts/requirements.txt> "
            f"(or: python -m pip install {pins})")


def check_core():
    """Raise one ImportError naming every missing hard requirement (no raw traceback from deep inside)."""
    missing = [n for n in CORE if importlib.util.find_spec(n) is None]
    if missing:
        raise ImportError(missing_message(missing))


def require(name, what='this mgaudio function'):
    """Import an optional package on first use, or raise ImportError naming its pinned version."""
    try:
        return importlib.import_module(name)
    except ImportError:
        raise ImportError(missing_message([name], what)) from None


def has(name):
    """True when the package is installed and fallback mode is not forced."""
    return not FORCED and importlib.util.find_spec(name) is not None


_has = has


check_core()
import numpy as np  # noqa: E402

HAVE = {n: _has(n) for n in FAST}
MODE = 'fast' if all(HAVE.values()) else 'fallback'
BACKEND = {'mode': MODE, 'forced': FORCED, **{n: ('installed' if v else 'numpy fallback') for n, v in HAVE.items()}}


def notice_once():
    """One stderr line in fallback mode so the agent can log which path rendered the score."""
    if MODE == 'fallback' and not getattr(notice_once, 'done', False):
        notice_once.done = True
        gone = ', '.join(n for n, v in HAVE.items() if not v)
        sys.stderr.write(f"[mgaudio] fallback mode (numpy only for: {gone}). Valid output, slower, not "
                         f"bit-identical to the fast path. {'Forced by MGAUDIO_FALLBACK.' if FORCED else ''}\n")


# ============================================================================ numba
if HAVE['numba']:
    from numba import njit  # noqa: F401
else:
    def njit(*args, **kwargs):
        """No-op stand-in for numba.njit: the kernel runs as plain Python."""
        if len(args) == 1 and callable(args[0]) and not kwargs:
            return args[0]
        return lambda f: f


# ============================================================================ scipy stand-ins (numpy, FFT based)
def _np_next_fast_len(n):
    n = max(1, int(n))
    best = 1 << (n - 1).bit_length()
    p5 = 1
    while p5 < best:
        p35 = p5
        while p35 < best:
            q = p35
            while q < n:
                q *= 2
            best = min(best, q)
            p35 *= 3
        p5 *= 5
    return best


def _np_butter(order, wn, btype='low', fs=2.0, output='sos'):
    """Digital Butterworth as second-order sections (analog prototype, bilinear transform), like scipy."""
    if output != 'sos':
        raise ValueError('the numpy fallback of butter supports output="sos" only')
    N = int(order)
    wn = np.atleast_1d(np.asarray(wn, float))
    warped = 2.0 * fs * np.tan(np.pi * wn / fs)
    p = np.exp(1j * np.pi * (2 * np.arange(N) + N + 1) / (2 * N))
    z = np.zeros(0, complex)
    k = 1.0
    if btype in ('low', 'lowpass'):
        wo = warped[0]
        p, k = p * wo, k * wo ** N
    elif btype in ('high', 'highpass'):
        wo = warped[0]
        p, z = wo / p, np.zeros(N, complex)
    elif btype in ('band', 'bandpass'):
        bw, wo = warped[1] - warped[0], math.sqrt(warped[0] * warped[1])
        ph = p * bw / 2
        root = np.sqrt(ph ** 2 - wo ** 2)
        p = np.concatenate([ph + root, ph - root])
        z, k = np.zeros(N, complex), k * bw ** N
    else:
        raise ValueError(f'unsupported btype {btype!r}')
    fs2 = 2.0 * fs
    zd = (fs2 + z) / (fs2 - z)
    pd = (fs2 + p) / (fs2 - p)
    zd = np.concatenate([zd, -np.ones(len(p) - len(z))])
    kd = k * np.real(np.prod(fs2 - z) / np.prod(fs2 - p))
    # pair poles: conjugate pairs first, then real poles two by two; zeros are all real (+1 or -1)
    cp = sorted([q for q in pd if q.imag > 1e-12], key=lambda q: abs(q))
    rp = sorted([q.real for q in pd if abs(q.imag) <= 1e-12], key=abs)
    zr = sorted(np.real(zd).tolist())
    secs = []
    for q in cp:
        secs.append(([1.0, -2 * q.real, abs(q) ** 2]))
    while len(rp) >= 2:
        a, b = rp.pop(), rp.pop()
        secs.append([1.0, -(a + b), a * b])
    if rp:
        secs.append([1.0, -rp.pop(), 0.0])
    sos = []
    for den in secs:
        order2 = 2 if den[2] != 0.0 else 1
        zz = [zr.pop() for _ in range(min(order2, len(zr)))]
        num = np.poly(zz) if zz else np.array([1.0])
        num = np.concatenate([num, np.zeros(3 - len(num))])
        sos.append(np.concatenate([num, den]))
    sos = np.array(sos, float)
    sos[0, :3] *= kd
    return sos


_RESPONSES = {}


def _sos_response(sos, nfft):
    key = (np.asarray(sos, float).tobytes(), nfft)
    h = _RESPONSES.get(key)
    if h is None:
        w = np.exp(-1j * np.pi * np.arange(nfft // 2 + 1) / (nfft // 2))
        w2 = w * w
        h = np.ones(nfft // 2 + 1, complex)
        for b0, b1, b2, a0, a1, a2 in np.asarray(sos, float):
            h *= (b0 + b1 * w + b2 * w2) / (a0 + a1 * w + a2 * w2)
        if len(_RESPONSES) > 256:
            _RESPONSES.clear()
        _RESPONSES[key] = h
    return h


def _ir_length(sos):
    """Samples until the slowest pole has decayed by 200 dB (the padding the FFT filter needs)."""
    r = max(max(np.abs(np.roots([a0, a1, a2])), default=0.0) for _b0, _b1, _b2, a0, a1, a2 in np.asarray(sos, float))
    if r >= 1.0:
        raise ValueError('unstable filter (pole on or outside the unit circle)')
    return 64 if r < 1e-6 else int(min(1 << 21, 64 + math.log(1e-10) / math.log(r)))


def _np_sosfilt(sos, x, axis=-1):
    """Causal IIR filtering by FFT with zero padding longer than the impulse response (computed from the
    poles), so nothing wraps around. Same output as scipy.signal.sosfilt within float rounding."""
    x = np.asarray(x, float)
    n = x.shape[axis]
    if n == 0:
        return x.copy()
    nfft = _np_next_fast_len(n + _ir_length(sos))
    nfft += nfft % 2
    X = np.fft.rfft(x, nfft, axis=axis)
    shape = [1] * x.ndim
    shape[axis] = -1
    y = np.fft.irfft(X * _sos_response(sos, nfft).reshape(shape), nfft, axis=axis)
    return np.take(y, np.arange(n), axis=axis)


def _np_resample(x, num, axis=0):
    """FFT resampling, same algorithm as scipy.signal.resample for real input."""
    x = np.asarray(x, float)
    nx = x.shape[axis]
    num = int(num)
    X = np.fft.rfft(x, axis=axis)
    shape = list(X.shape)
    shape[axis] = num // 2 + 1
    Y = np.zeros(shape, complex)
    N = min(num, nx)
    nyq = N // 2 + 1
    sl = [slice(None)] * x.ndim
    sl[axis] = slice(0, nyq)
    Y[tuple(sl)] = X[tuple(sl)]
    if N % 2 == 0:
        sl[axis] = slice(N // 2, N // 2 + 1)
        if num < nx:
            Y[tuple(sl)] *= 2.0
        elif nx < num:
            Y[tuple(sl)] *= 0.5
    return np.fft.irfft(Y, num, axis=axis) * (float(num) / float(nx))


def _np_resample_poly(x, up, down, axis=0):
    """Rational resampling by FFT with zero padding at both ends (resample_poly also assumes zeros outside)."""
    x = np.asarray(x, float)
    up, down = int(up), int(down)
    g = math.gcd(up, down)
    up, down = up // g, down // g
    n = x.shape[axis]
    out_len = -(-n * up // down)
    if up == down or n == 0:
        return x.copy()
    pad = down * max(1, -(-256 // down))
    m = down * _np_next_fast_len(-(-(n + 2 * pad) // down))
    widths = [(0, 0)] * x.ndim
    widths[axis] = (pad, m - n - pad)
    y = _np_resample(np.pad(x, widths), m * up // down, axis=axis)
    start = pad * up // down
    return np.take(y, np.arange(start, start + out_len), axis=axis)


def _np_fftconvolve(a, b, mode='full', axes=None):
    a, b = np.asarray(a, float), np.asarray(b, float)
    axis = -1 if axes is None else (axes if isinstance(axes, int) else axes[0])
    la, lb = a.shape[axis], b.shape[axis]
    full = la + lb - 1
    nfft = _np_next_fast_len(full)
    y = np.fft.irfft(np.fft.rfft(a, nfft, axis=axis) * np.fft.rfft(b, nfft, axis=axis), nfft, axis=axis)
    if mode == 'full':
        start, length = 0, full
    elif mode == 'same':
        start, length = (full - la) // 2, la
    else:
        raise ValueError('the numpy fallback of fftconvolve supports mode "full" and "same"')
    return np.take(y, np.arange(start, start + length), axis=axis)


def _np_firwin(numtaps, cutoff, width=None, fs=2.0):
    """Low-pass FIR by the window method; Kaiser window from `width` as in scipy.signal.firwin."""
    nyq = fs / 2.0
    fc = float(cutoff) / nyq
    if width is not None:
        atten = 2.285 * (numtaps - 1) * np.pi * (width / nyq) + 7.95
        if atten > 50:
            beta = 0.1102 * (atten - 8.7)
        elif atten > 21:
            beta = 0.5842 * (atten - 21) ** 0.4 + 0.07886 * (atten - 21)
        else:
            beta = 0.0
        win = np.kaiser(numtaps, beta)
    else:
        win = np.hamming(numtaps)
    m = np.arange(numtaps) - (numtaps - 1) / 2.0
    h = fc * np.sinc(fc * m) * win
    return h / np.sum(h)


def _np_uniform_filter1d(x, size, mode='reflect'):
    x = np.asarray(x, float)
    size = int(size)
    pm = {'reflect': 'symmetric', 'nearest': 'edge', 'mirror': 'reflect', 'constant': 'constant'}[mode]
    xp = np.pad(x, (size // 2, size - 1 - size // 2), mode=pm)
    c = np.concatenate([[0.0], np.cumsum(xp)])
    return (c[size:] - c[:-size]) / size


def _np_minimum_filter1d(x, size, mode='reflect'):
    """Running minimum (van Herk / Gil-Werman, vectorised)."""
    x = np.asarray(x, float)
    size = int(size)
    n = x.shape[0]
    pm = {'reflect': 'symmetric', 'nearest': 'edge', 'mirror': 'reflect'}[mode]
    xp = np.pad(x, (size // 2, size - 1 - size // 2), mode=pm)
    L = -(-xp.shape[0] // size) * size
    blocks = np.pad(xp, (0, L - xp.shape[0]), constant_values=np.inf).reshape(-1, size)
    pre = np.minimum.accumulate(blocks, axis=1).ravel()
    suf = np.minimum.accumulate(blocks[:, ::-1], axis=1)[:, ::-1].ravel()
    return np.minimum(suf[:n], pre[size - 1:size - 1 + n])


def _hann(n):
    return 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(n) / n)   # periodic, as scipy get_window('hann')


def _np_welch(x, fs=1.0, nperseg=256):
    x = np.asarray(x, float)
    nperseg = min(int(nperseg), x.shape[-1])
    hop = nperseg - nperseg // 2
    win = _hann(nperseg)
    idx = np.arange(0, x.shape[-1] - nperseg + 1, hop)
    segs = np.stack([x[i:i + nperseg] for i in idx])
    segs = segs - segs.mean(axis=1, keepdims=True)
    P = np.abs(np.fft.rfft(segs * win, axis=1)) ** 2 / (fs * np.sum(win ** 2))
    P = P.mean(axis=0)
    P[1:-1 if nperseg % 2 == 0 else None] *= 2
    return np.fft.rfftfreq(nperseg, 1.0 / fs), P


def _np_stft(x, fs=1.0, nperseg=256, noverlap=None):
    x = np.asarray(x, float)
    noverlap = nperseg // 2 if noverlap is None else int(noverlap)
    hop = nperseg - noverlap
    win = _hann(nperseg)
    xp = np.pad(x, (nperseg // 2, nperseg // 2))
    extra = (-(xp.shape[0] - nperseg) % hop) % hop
    xp = np.pad(xp, (0, extra))
    idx = np.arange(0, xp.shape[0] - nperseg + 1, hop)
    Z = np.fft.rfft(np.stack([xp[i:i + nperseg] for i in idx]) * win, axis=1).T / np.sum(win)
    return np.fft.rfftfreq(nperseg, 1.0 / fs), idx / fs, Z


class _NpSignal:
    butter = staticmethod(_np_butter)
    sosfilt = staticmethod(_np_sosfilt)
    resample = staticmethod(_np_resample)
    resample_poly = staticmethod(_np_resample_poly)
    fftconvolve = staticmethod(_np_fftconvolve)
    firwin = staticmethod(_np_firwin)
    welch = staticmethod(_np_welch)
    stft = staticmethod(_np_stft)


if HAVE['scipy']:
    from scipy import signal  # noqa: F401
    from scipy.signal import resample, resample_poly, fftconvolve, firwin, welch, stft  # noqa: F401
    from scipy.fft import next_fast_len  # noqa: F401
    from scipy.ndimage import minimum_filter1d, uniform_filter1d  # noqa: F401
else:
    signal = _NpSignal()
    resample, resample_poly, fftconvolve = _np_resample, _np_resample_poly, _np_fftconvolve
    firwin, welch, stft = _np_firwin, _np_welch, _np_stft
    next_fast_len = _np_next_fast_len
    minimum_filter1d, uniform_filter1d = _np_minimum_filter1d, _np_uniform_filter1d


# ============================================================================ loudness (pyloudnorm stand-in)
# ITU-R BS.1770-4 K-weighting at 48 kHz (stage 1 shelf, stage 2 RLB high-pass), as published in the standard.
_K48 = np.array([[1.53512485958697, -2.69169618940638, 1.19839281085285, 1.0, -1.69065929318241, 0.73248077421585],
                 [1.0, -2.0, 1.0, 1.0, -1.99004745483398, 0.99007225036621]])


def _np_integrated_loudness(data, rate):
    """data: (n, channels). Gated integrated loudness in LUFS (400 ms blocks, 75 % overlap, -70 and -10 gates)."""
    if int(rate) != 48000:
        raise ValueError('the numpy loudness meter runs at 48 kHz (mgaudio renders at 48 kHz)')
    x = np.asarray(data, float)
    if x.ndim == 1:
        x = x[:, None]
    n = x.shape[0]
    T, hop = 19200, 4800
    if n < T:
        return float('-inf')
    k = _np_sosfilt(_K48, x, axis=0)
    c = np.concatenate([np.zeros((1, x.shape[1])), np.cumsum(k ** 2, axis=0)])
    starts = np.arange(0, n - T + 1, hop)
    z = (c[starts + T] - c[starts]) / T                     # (blocks, channels) mean square
    zs = z[:, :5].sum(axis=1)                               # L, R, C weight 1 (surround weights unused here)
    lj = -0.691 + 10 * np.log10(zs + 1e-30)
    abs_ok = lj > -70.0
    if not abs_ok.any():
        return float('-inf')
    gr = -0.691 + 10 * np.log10(zs[abs_ok].mean()) - 10.0
    ok = abs_ok & (lj > gr)
    return float(-0.691 + 10 * np.log10(zs[ok].mean()))


def integrated_loudness(data, rate):
    """pyloudnorm's Meter(rate).integrated_loudness(data) when installed, else the numpy meter above."""
    if HAVE['pyloudnorm']:
        import pyloudnorm
        return pyloudnorm.Meter(rate).integrated_loudness(data)
    return _np_integrated_loudness(data, rate)


# ============================================================================ WAV files (soundfile stand-in)
_SUBTYPE_BYTES = {'PCM_16': 2, 'PCM_24': 3, 'PCM_32': 4}


def write_wav(path, data, rate, subtype='PCM_24'):
    """data: (n, channels) float in -1..1. soundfile when installed, else the standard library wave module."""
    data = np.asarray(data)
    if HAVE['soundfile']:
        import soundfile as sf
        sf.write(path, data.astype(np.float32), rate, subtype=subtype)
        return
    if subtype not in _SUBTYPE_BYTES:
        raise ValueError(f"the wave-module writer supports {sorted(_SUBTYPE_BYTES)}, not {subtype!r} "
                         f"(float WAV needs {PINS['soundfile']})")
    import wave
    w = _SUBTYPE_BYTES[subtype]
    if data.ndim == 1:
        data = data[:, None]
    full = float(2 ** (8 * w - 1) - 1)
    q = np.round(np.clip(data, -1.0, 1.0) * full).astype('<i4')
    raw = q.reshape(-1, 1).view(np.uint8).reshape(-1, 4)[:, :w].tobytes()
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(data.shape[1])
        f.setsampwidth(w)
        f.setframerate(int(rate))
        f.writeframes(raw)


def read_wav(path, dtype='float64'):
    """Returns (data (n, channels) float, rate). soundfile when installed, else wave (PCM WAV only)."""
    if HAVE['soundfile']:
        import soundfile as sf
        return sf.read(str(path), always_2d=True, dtype=dtype)
    import wave
    try:
        with wave.open(str(path), 'rb') as f:
            ch, w, rate, n = f.getnchannels(), f.getsampwidth(), f.getframerate(), f.getnframes()
            raw = f.readframes(n)
    except (wave.Error, EOFError) as e:
        raise ValueError(f"{path}: the wave-module reader needs a PCM WAV ({e}). Convert first: ffmpeg -i <in> "
                         f"-ar 48000 -c:a pcm_s24le <out.wav>, or install {PINS['soundfile']}") from None
    b = np.frombuffer(raw, np.uint8)
    if w == 1:
        x = (b.astype(np.float64) - 128.0) / 128.0
    else:
        b = b.reshape(-1, w)
        pad = np.zeros((b.shape[0], 4), np.uint8)
        pad[:, 4 - w:] = b                              # little-endian sample in the top bytes keeps the sign
        x = pad.view('<i4').ravel().astype(np.float64) / 2.0 ** 31
    return x.reshape(-1, ch).astype(dtype), rate
