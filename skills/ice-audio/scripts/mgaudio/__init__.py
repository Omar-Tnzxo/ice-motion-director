# Adapted from Vincentwei1021/mg-styles-15 (MIT, Copyright (c) 2026 Vincentwei1021). Changes: import path and API doc pointer in this docstring; package __main__.py not shipped; only numpy is required (numba, scipy, soundfile and pyloudnorm are used when installed, numpy and wave-module fallbacks otherwise, see _deps.py); BACKEND reports which path runs.
"""mgaudio - motion-graphics audio toolkit (48 kHz float stereo, numpy; numba, scipy and pedalboard when installed).

    import sys; sys.path.insert(0, 'ice/audio/lib')   # the folder that holds this mgaudio package
    import mgaudio as mg
    from mgaudio import sfx, drums, synth, recipes, sync, qc
    print(mg.BACKEND)   # {'mode': 'fast' or 'fallback', ...}: log it with the score

See the ice-audio skill, references/music-by-code.md, for the API reference and examples.
"""
from ._deps import check_core as _check_core, notice_once as _notice_once, BACKEND, MODE  # noqa: F401

_check_core()  # numpy only; the fast-path packages are optional (see _deps.py)
_notice_once()

from .core import (SR, Sound, ns, amp, db, layer, concat, fade, rng, reset_rng, as_sound, silence, peak, rms,  # noqa
                   normalize, adsr, perc_env, ramp, exp_ramp, breakpoints, lfo, white, pink, brown, noise_st,
                   pan_mono, pan_curve, width, to_stereo, to_mono)
from . import core, theory, osc, filters, fx, synth, fm, pluck, wind, chip, drums, sfx, samples, mix, master  # noqa
from . import qc, seq, sync, recipes  # noqa
from .mix import Mix, Grid, fit_bpm  # noqa
from .theory import hz, midi, name, scale, chord, progression, roman, chord_symbols, degree  # noqa
from .qc import analyze, spectrogram, check_duration, hit_alignment, summary  # noqa
from .master import write, lufs, true_peak, master as master_buffer, normalize_file  # noqa
from .recipes import RECIPES, STYLES, recipe, for_style, Form  # noqa

__version__ = '1.0'
