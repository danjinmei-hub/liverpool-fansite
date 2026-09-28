"""Procedural score + sound design for 《光环》(60 s). Writes score.wav (48 kHz stereo).
Every cue is timed to the same timeline as index.html."""
import wave
import numpy as np

SR = 48000
DUR = 60.0
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(7)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def put(sig, t0, amp=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * amp
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gl
    R[i:i + len(sig)] += sig * gr


def tt(d):
    return np.arange(int(d * SR)) / SR


def adsr(t, a, rel, total):
    e = np.minimum(1, t / max(a, 1e-4))
    return e * np.clip((total - t) / rel, 0, 1)


def pad(notes, t0, t1, fin=2.0, fout=2.0, amp=0.05, bright=6, trem=0.0, pan=0.0):
    t = tt(t1 - t0)
    out = np.zeros_like(t)
    for m in notes:
        f = midi(m)
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            ph = rng.random() * 6.28
            for n in range(1, bright + 1):
                out += np.sin(2 * np.pi * ff * n * t + ph * n) / n ** 1.7
    env = adsr(t, fin, fout, t1 - t0)
    if trem:
        env = env * (1 - 0.35 * (0.5 + 0.5 * np.sin(2 * np.pi * trem * t)))
    put(out * env / (len(notes) * 3), t0, amp, pan)


def choir(notes, t0, t1, amp=0.06):
    """additive 'aah' — harmonics shaped by vowel formants, with vibrato."""
    t = tt(t1 - t0)
    out = np.zeros_like(t)
    formants = [(800, 90, 1.0), (1150, 110, 0.5), (2900, 160, 0.12)]
    for k, m in enumerate(notes):
        f0 = midi(m)
        vib = 1 + 0.006 * np.sin(2 * np.pi * (5.2 + 0.3 * k) * t + k)
        phase = 2 * np.pi * f0 * np.cumsum(vib) / SR
        for n in range(1, 40):
            fn = f0 * n
            if fn > 5000:
                break
            g = sum(a * np.exp(-((fn - fc) / bw) ** 2 / 2) for fc, bw, a in formants) + 0.02 / n
            out += g * np.sin(n * phase)
    env = adsr(t, 1.6, 2.6, t1 - t0)
    put(out * env / len(notes), t0, amp, 0)


def bell(m, t0, amp=0.2, decay=2.5, pan=0.0, partials=((1, 1), (2.0, .5), (3.01, .25), (4.2, .12), (5.4, .06))):
    t = tt(decay * 2.2)
    f = midi(m)
    out = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * r / decay) for r, a in partials)
    out *= np.minimum(1, t / 0.004)
    put(out, t0, amp, pan)


def piano(m, t0, amp=0.16, pan=0.0):
    bell(m, t0, amp, decay=1.6, pan=pan, partials=((1, 1), (2.002, .4), (3.005, .18), (4.01, .08), (5.02, .04)))


def thump(t0, amp=0.5, f0=62):
    t = tt(0.5)
    f = f0 * (1 + 1.4 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    put(s, t0, amp)


def boom(t0, amp=0.9, dur=3.5):
    t = tt(dur)
    f = 30 + 70 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4)
    nz = lowpass(rng.standard_normal(len(t)), 250) * np.exp(-t * 3) * 0.6
    put(s + nz, t0, amp)


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def sweep_noise(t0, t1, f_lo, f_hi, amp, curve=2.0):
    """noise through a one-pole lowpass whose cutoff rises (a riser)."""
    n = int((t1 - t0) * SR)
    x = rng.standard_normal(n)
    p = np.linspace(0, 1, n)
    fc = f_lo + (f_hi - f_lo) * p ** curve
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    y *= p ** 2.2
    put(y / np.abs(y).max(), t0, amp)


def glass(t0, amp=0.25, count=70, spread=1.6):
    for _ in range(count):
        st = t0 + rng.random() ** 2 * spread
        f = 1800 + rng.random() * 6500
        d = 0.15 + rng.random() * 1.1
        t = tt(d * 4)
        s = np.sin(2 * np.pi * f * t) * np.exp(-t / d * 1.5) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / d * 3)
        put(s * np.minimum(1, t / 0.002), st, amp * (0.3 + rng.random() * 0.7) / 6, rng.uniform(-.9, .9))
    # the crack itself: bright noise burst
    t = tt(0.9)
    nz = rng.standard_normal(len(t))
    hp = nz - lowpass(nz, 2500)
    put(hp * np.exp(-t * 9), t0, amp * 1.4)


# ================= CUES =================
# Act I — spark, three lines, title
pad([38, 45, 50, 53], 0.0, 12.5, fin=4, fout=2.5, amp=0.10)            # D minor drone
bell(86, 0.45, 0.07, decay=3.0)                                         # the spark
piano(62, 1.0, pan=-.3); piano(65, 2.3); piano(69, 3.6, pan=.3); piano(74, 3.62, .07, pan=.3)
sweep_noise(4.6, 7.0, 200, 9000, 0.10)                                   # spark -> ring
boom(7.0, 0.55)
choir([50, 57, 62, 66, 69], 6.9, 12.0, amp=0.075)                       # "Messiah": sacred D major
bell(74, 7.05, 0.12, decay=4); bell(81, 7.08, 0.07, decay=4, pan=.4); bell(86, 7.12, 0.05, decay=4, pan=-.4)

# Act II — definition
pad([38, 45, 50, 53, 57], 11.0, 21.5, fin=2, fout=2, amp=0.075, trem=0.25)
for tm, m, p in [(12.9, 57, -.3), (13.7, 60, 0), (14.5, 64, .3), (16.7, 57, -.3), (17.5, 62, 0), (18.5, 65, .3), (19.0, 69, .4)]:
    piano(m, tm, 0.13, p)

# Act III — three symptoms: bell tolls, heartbeat accelerates, tension builds
for i, t0 in enumerate([22.0, 27.2, 32.4]):
    bell(38, t0, 0.20, decay=3.5, partials=((1, 1), (2.4, .5), (3.9, .3), (5.2, .2)))
    bell(62 + [0, 1, 3][i], t0 + 0.02, 0.07, decay=3)
pad([38, 50, 51], 21.5, 42.8, fin=8, fout=0.25, amp=0.09, bright=8, trem=3.0)   # D + Eb: unease
pad([62, 63], 30.0, 42.8, fin=10, fout=0.25, amp=0.05, bright=5, trem=6.0)
t = 22.4
while t < 42.4:
    bpm = 62 + 70 * ((t - 22.4) / 20.0) ** 1.4
    thump(t, 0.45); thump(t + 0.17, 0.28)
    t += 60.0 / bpm
tw = tt(44.95 - 30.0)                                                    # tinnitus of the glare
whine = np.sin(2 * np.pi * (4100 + 60 * np.sin(tw * 3)) * tw) * (tw / tw[-1]) ** 3
put(whine, 30.0, 0.025)

# Act IV — others ignite, halo trembles, shatter
for i, m in enumerate([74, 76, 78, 81, 83, 86]):
    bell(m, 41.2 + i * 0.36, 0.10, decay=2.5, pan=-.8 + i * .32)
pad([50, 54, 57, 62], 40.4, 44.9, fin=1.5, fout=0.3, amp=0.05)
sweep_noise(42.6, 45.0, 60, 6000, 0.22, curve=3.0)
tr = tt(2.4)
put(np.sin(2 * np.pi * 42 * tr) * (tr / tr[-1]) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tr)), 42.6, 0.35)
boom(45.0, 1.0, dur=4.5)
glass(45.0, 0.9, count=90, spread=2.2)

# Act V — resolution in D major, a music box
pad([38, 45, 50, 54, 57], 46.3, 60.0, fin=3.5, fout=1.8, amp=0.10)
choir([62, 66, 69], 51.0, 58.8, amp=0.035)
mel = [(47.4, 78), (47.9, 81), (48.4, 86), (49.3, 85), (49.8, 81), (50.8, 83), (51.3, 81), (51.8, 78),
       (52.7, 79), (53.2, 78), (53.7, 76), (54.5, 74)]
for tm, m in mel:
    bell(m, tm, 0.075, decay=1.8, pan=0.15, partials=((1, 1), (3.0, .18), (5.2, .05)))
for i, m in enumerate([62, 64, 66, 69, 71, 74]):                        # hands joining
    bell(m, 51.2 + i * 0.5, 0.045, decay=2, pan=-.7 + i * .28)
boom(55.4, 0.30, dur=4)
for m, p in [(50, -.2), (57, .2), (62, 0), (66, .3), (74, -.3)]:
    bell(m, 55.4, 0.07, decay=4.5, pan=p)

# ================= MIX =================
def reverb(x, seed, secs=3.2):
    r = np.random.default_rng(seed)
    t = tt(secs)
    ir = r.standard_normal(len(t)) * np.exp(-t * 2.3)
    ir[: int(0.012 * SR)] = 0
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
    return y / np.sqrt(np.sum(ir ** 2))

wl, wr = reverb(L, 1), reverb(R, 2)
outL, outR = L + 0.32 * wl, R + 0.32 * wr
fade = np.clip((DUR - np.arange(N) / SR) / 1.2, 0, 1) * np.clip(np.arange(N) / SR / 0.3, 0, 1)
outL *= fade; outR *= fade
# loudness: bring the body of the mix up, then a smooth block limiter tames the shatter
ref = np.sqrt(np.mean(outL[: int(40 * SR)] ** 2))
g0 = 10 ** (-19 / 20) / ref
outL, outR = outL * g0, outR * g0
B, THR = 240, 0.85
nb = N // B
pk = np.maximum(np.abs(outL[: nb * B]).reshape(nb, B).max(1), np.abs(outR[: nb * B]).reshape(nb, B).max(1))
pk = np.maximum.reduce([np.roll(pk, k) for k in range(-4, 2)])      # ~20 ms lookahead
gain = np.minimum(1, THR / np.maximum(pk, 1e-9))
sm = np.empty(nb); acc = 1.0
for i in range(nb):
    acc = gain[i] if gain[i] < acc else acc + (gain[i] - acc) * 0.02   # instant attack, slow release
    sm[i] = acc
gs = np.interp(np.arange(N), np.arange(nb) * B + B / 2, sm)
outL, outR = np.tanh(outL * gs * 1.05) * 0.93, np.tanh(outR * gs * 1.05) * 0.93
pcm = (np.stack([outL, outR], 1) * 32767).astype('<i2')
with wave.open('score.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('score.wav written', pcm.shape)
