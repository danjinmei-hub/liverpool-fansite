"""Original score + sound design for the RED CHORUS promo. 96 BPM, D major. Everything is synthesised."""
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
BEAT = 0.625
BAR = BEAT * 4
DUR = 120.0
N = int((DUR + 3) * SR)
rng = np.random.default_rng(7)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def zeros(): return np.zeros((2, N))
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR * 0.45), "low", fs=SR, output="sos"), x, axis=-1)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x, axis=-1)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, min(b, SR * .45)], "band", fs=SR, output="sos"), x, axis=-1)

def put(buf, sig, t, gain=1.0, pan=0.0):
    """add mono/stereo sig at time t"""
    i = int(t * SR)
    if i >= N or i + sig.shape[-1] <= 0: return
    if sig.ndim == 1:
        l = gain * np.cos((pan + 1) * np.pi / 4); r = gain * np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414])
    else: sig = sig * gain
    a = max(0, -i); i0 = max(0, i)
    n = min(sig.shape[-1] - a, N - i0)
    buf[:, i0:i0 + n] += sig[:, a:a + n]

def env_ad(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d_tau)
    return e
def env_asr(n, a, r):
    t = np.arange(n) / SR; T = n / SR
    return np.minimum(1, t / a) * np.minimum(1, (T - t) / r)

def saw(f, n, detune=(0,)):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in detune:
        ph = (t * f * 2 ** (d / 1200) + rng.random()) % 1
        out += 2 * ph - 1
    return out / len(detune)

def noise(n): return rng.standard_normal(n)

# ---------- instruments
def kick(vol=1.0):
    n = int(0.55 * SR); t = np.arange(n) / SR
    f = 42 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(noise(n), 2500) * np.exp(-t * 220) * 0.25
    return (body + click) * vol
def clap(vol=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    x = bp(noise(n), 900, 3800)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 60) * (t >= d) for d in (0, 0.011, 0.023)) * 0.5 + np.exp(-t * 14) * 0.6
    return x * e * vol
def hat(vol=1.0, open_=False):
    n = int((0.35 if open_ else 0.06) * SR); t = np.arange(n) / SR
    return hp(noise(n), 7000) * np.exp(-t * (14 if open_ else 90)) * vol
def tom(f0, vol=1.0, dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.exp(-t * 25))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 6) + hp(noise(n), 1500) * np.exp(-t * 100) * .15) * vol
def boom(vol=1.0, dur=3.5):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 30 + 90 * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t * 1.1)
    crash = hp(noise(n), 3000) * np.exp(-t * 2.2) * 0.5
    thud = lp(noise(n), 400) * np.exp(-t * 6) * 0.9
    return (sub * 1.2 + crash + thud) * vol
def whoosh(dur=0.7, up=True, vol=1.0, f0=300, f1=7000):
    n = int(dur * SR); t = np.arange(n) / SR; x = noise(n)
    out = np.zeros(n); k = 24
    seg = n // k
    for i in range(k):
        p = i / (k - 1); p = p if up else 1 - p
        f = f0 * (f1 / f0) ** p
        s = slice(i * seg, (i + 1) * seg if i < k - 1 else n)
        out[s] = bp(x[s], f * .7, f * 1.4, 1)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * e * vol * 4
def riser(dur, vol=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; p = t / dur
    x = whoosh(dur, True, 1.0, 200, 9000)[:n]
    f = 200 * (8 ** (p ** 1.5))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    return (x * (p ** 2) * 1.2 + tone * p) * vol
def revcrash(dur, vol=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = hp(noise(n), 4000) * (t / dur) ** 3
    return x * vol * 0.6
def pluck(m, dur=0.5, vol=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 12) + 0.18 * saw(f, n)) * env_ad(n, 0.003, 0.16)
    return lp(x, 4500, 1) * vol
def pad(midis, dur, vol=1.0, bright=1800, attack=0.8, release=1.2):
    n = int(dur * SR)
    L = np.zeros(n); R = np.zeros(n)
    for m in midis:
        f = hz(m)
        L += saw(f, n, (-9, 3, 11)); R += saw(f, n, (-11, -3, 9))
    sig = np.stack([lp(L, bright, 2), lp(R, bright, 2)]) / max(1, len(midis)) * env_asr(n, attack, release)
    return sig * vol
def bass(m, dur, vol=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * lp(saw(f, n), 500, 2)
    return x * env_asr(n, 0.01, 0.12) * vol
def lead(m, dur, vol=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.4)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph) + 0.15 * lp(saw(f, n, (-6, 6)), 3000, 2)
    return x * env_asr(n, 0.02, 0.18) * vol
def choir(m, dur, vol=1.0):
    n = int(dur * SR); f = hz(m)
    src = saw(f, n, (-14, -5, 6, 15))
    ah = bp(src, 650, 950, 1) * 1.0 + bp(src, 1000, 1400, 1) * 0.6 + bp(src, 2400, 3000, 1) * 0.25
    return ah * env_asr(n, 1.2, 1.6) * vol * 2.0
def crowd(dur, vol=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(noise(n), 300, 2200, 2)
    mod = 0.55 + 0.45 * np.sin(2 * np.pi * 0.6 * t + np.sin(2 * np.pi * 0.13 * t) * 3)
    mod2 = 0.7 + 0.3 * np.sin(2 * np.pi * (1 / BEAT) * t)
    return np.stack([x * mod * mod2, np.roll(x, 900) * mod * mod2]) * vol
def tick(vol=1.0):
    n = int(0.03 * SR); t = np.arange(n) / SR
    return hp(noise(n), 3000) * np.exp(-t * 300) * vol

def reverb(sig, wet=0.3, T=2.4, pre=0.02):
    n = int(T * SR); t = np.arange(n) / SR
    ir = np.stack([noise(n), noise(n)]) * np.exp(-t * (6.9 / T))
    ir = lp(ir, 5500, 1); ir[:, :int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(-1, keepdims=True))
    out = np.stack([fftconvolve(sig[0], ir[0])[:N], fftconvolve(sig[1], ir[1])[:N]])
    return sig * (1 - wet * 0.5) + out * wet

# ---------- score
CH = {  # name: (bass midi, chord midis)
    "Bm": (35 + 12, [59, 62, 66]), "G": (43, [55, 59, 62]), "D": (38, [54, 57, 62]), "A": (45, [57, 61, 64]),
    "Em": (40, [55, 59, 64]),
}
PROG = ["Bm", "G", "D", "A"]
MOTIF = {  # per chord: (beat, midi, beats)
    "Bm": [(0, 78, 1), (1, 81, 1), (2, 83, 1.5), (3.5, 81, .5)],
    "G": [(0, 79, 1), (1, 78, 1), (2, 74, 2)],
    "D": [(0, 78, 1), (1, 81, 1), (2, 86, 1.5), (3.5, 83, .5)],
    "A": [(0, 85, 1), (1, 81, 1), (2, 88 - 3, 2)],
}
def chord_at(bar, prog=PROG): return prog[bar % len(prog)]

drums = zeros(); harm = zeros(); bassb = zeros(); lead_b = zeros(); fx = zeros(); arp = zeros(); amb = zeros()
duck = np.ones(N)
def kick_at(t, v=1.0):
    put(drums, kick(v), t, 1.0)
    i = int(t * SR); n = int(0.42 * SR)
    if i < N:
        k = 1 - 0.65 * np.exp(-np.arange(min(n, N - i)) / SR / 0.11)
        duck[i:i + len(k)] = np.minimum(duck[i:i + len(k)], k)

def four_floor(t0, t1, v=1.0, clap_on=True, hats=True, hat_v=0.35):
    t = t0
    while t < t1 - 1e-6:
        kick_at(t, v)
        b = int(round((t - t0) / BEAT))
        if hats:
            put(drums, hat(hat_v * .9), t + BEAT / 2, 1.0, 0.2)
        if clap_on and b % 2 == 1: put(drums, clap(0.55), t, 1.0)
        t += BEAT

def harmony(t0, t1, prog=PROG, pad_v=0.5, bass_v=0.7, bright=1800, bass_on=True):
    b0 = int(round(t0 / BAR)); t = t0
    while t < t1 - 1e-6:
        c = chord_at(int(round((t - t0) / BAR)), prog); bm, ch = CH[c]
        d = min(BAR, t1 - t)
        put(harm, pad(ch + [ch[0] + 12], d + 0.4, pad_v, bright, 0.5, 0.9), t)
        if bass_on:
            for k in range(4):
                if k in (0, 2) or True:
                    put(bassb, bass(bm, BEAT * (0.9 if k % 2 else 0.95)), t + k * BEAT, bass_v * (1 if k % 2 == 0 else 0.7))
        t += BAR

def arpeggio(t0, t1, prog=PROG, v=0.35, octave=12, step=BEAT / 2):
    t = t0
    while t < t1 - 1e-6:
        bar = int(round((t - t0) / BAR - 0.499999))
        c = chord_at(bar, prog); ch = CH[c][1]
        seq = [ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1], ch[0] + 12, ch[1]]
        k = int(round((t - t0 - bar * BAR) / step)) % 8
        put(arp, pluck(seq[k] + octave, 0.6, v), t, 1.0, -0.3 + 0.6 * (k % 2))
        t += step

def play_motif(t0, bars, prog=PROG, v=0.45, oct_=0, start_bar=0):
    for b in range(bars):
        c = chord_at(start_bar + b, prog)
        for (bt, m, ln) in MOTIF[c]:
            put(lead_b, lead(m + oct_, ln * BEAT * 0.98 + 0.25, v), t0 + b * BAR + bt * BEAT, 1.0, 0.1)

# ---- 0–10 HOOK
put(amb, pad([38, 45, 50], 10.5, 0.55, 500, 3.5, 0.3), 0.0)
put(amb, crowd(10.0, 0.16) * np.linspace(0.05, 1, int(10 * SR)) ** 2, 0.0)
t = 0.0
while t < 9.8:  # heartbeat, accelerating feel
    put(drums, kick(0.8), t, 0.9); put(drums, kick(0.5), t + 0.22, 0.9)
    t += BEAT * 2 if t < 3 else BEAT
for tt in (0.5, 3.05, 5.3): put(fx, whoosh(0.6, True, 0.25, 400, 5000), tt - 0.45)
put(fx, whoosh(0.9, True, 0.3, 300, 4000), 3.6)  # dash draw
put(fx, riser(2.05, 0.6), 7.8)
for i in range(7):
    tt = 7.8125 + i * BEAT / 2
    put(drums, tom(90 + i * 14, 0.7, 0.3), tt, 1.0); put(fx, tick(0.6), tt)
    put(drums, clap(0.4 + 0.05 * i), tt, 1.0)
# silence gap 9.86–10.0
# ---- 10.0 IMPACT + TITLE
put(fx, boom(1.0), 10.0, 1.0)
put(fx, revcrash(0.6, 0.0 + 0.7), 9.4)
put(fx, whoosh(0.6, False, 0.4, 600, 9000), 10.0)
for tt in (10.05, 10.37): put(drums, tom(70, 0.9, 0.5), tt, 1.0)
put(drums, tom(70, 0.9, 0.5), 10.0, 1.0)
four_floor(10.625 if False else 10.0 + BEAT, 17.5, 1.0, True, True, 0.3)
put(harm, pad([50, 57, 62, 66, 69, 74], 1.6, 0.9, 2600, 0.02, 1.2), 10.0)
harmony(10.0 + 0.0, 17.5, prog=["D", "A", "Bm", "G"], pad_v=0.55, bass_v=0.75, bright=2200)
arpeggio(10.0, 17.5, prog=["D", "A", "Bm", "G"], v=0.32)
play_motif(10.0, 3, prog=["D", "A", "Bm", "G"], v=0.45, oct_=0)
# typing ticks (title tagline typewriter 12.2–13.8)
for k in range(31): put(fx, tick(0.28), 10 + 2.2 + k * (1.6 / 31))
# nav list slides
for i in range(5): put(fx, whoosh(0.3, True, 0.14, 800, 5000), 10 + 2.6 + i * 0.22 - 0.1)
# transition whoosh helper
def wipe(tb): put(fx, whoosh(0.64, True, 0.5, 250, 8000), tb - 0.34); put(fx, boom(0.28, 1.4), tb - 0.02, 1.0)
# ---- 17.5–40 MATCHDAY
wipe(17.5)
four_floor(17.5, 40, 1.0, True, True, 0.32)
harmony(17.5, 40, pad_v=0.5, bass_v=0.8)
arpeggio(17.5, 40, v=0.3)
play_motif(25.0, 4, oct_=0, v=0.4, start_bar=0)
play_motif(32.5, 6, oct_=0, v=0.42, start_bar=0)
for tt in (17.5 + 5.625, 17.5 + 11.25, 17.5 + 16.875):
    put(fx, whoosh(0.5, True, 0.35, 300, 6000), tt - 0.4); put(fx, tick(0.6), tt); put(drums, tom(110, 0.6, 0.4), tt, 1.0)
for i, tt in enumerate((17.5 + 5.2, 17.5 + 5.36, 17.5 + 5.52)): put(fx, whoosh(0.4, True, 0.18, 300, 4000), tt)
# ---- 40–50 ARCHIVE
wipe(40)
four_floor(40, 50, 1.0, True, True, 0.34)
harmony(40, 50, pad_v=0.5, bass_v=0.8)
arpeggio(40, 50, v=0.32, octave=12)
play_motif(40, 4, oct_=12, v=0.3, start_bar=0)
put(fx, whoosh(0.6, True, 0.4, 300, 5000), 46.25 - 0.35); put(fx, boom(0.4, 1.5), 46.25, 1.0)
# ---- 50–70 SQUAD
wipe(50)
for i in range(10):  # number flash hits
    tt = 50 + i * BEAT
    put(drums, tom(80 + i * 6, 0.9, 0.4), tt, 1.0); put(fx, tick(0.6), tt); put(drums, clap(0.35), tt + BEAT / 2, 1.0)
    kick_at(tt, 0.9)
four_floor(56.25, 70, 1.0, True, True, 0.4)
harmony(50, 70, pad_v=0.55, bass_v=0.85, bright=2400)
arpeggio(50, 70, v=0.34, octave=12)
play_motif(56.25, 6, oct_=12, v=0.34)
play_motif(63.75, 4, oct_=0, v=0.42)
for tt in np.arange(50, 70, BEAT * 2): put(drums, hat(0.45, True), tt + BEAT * 1.5, 1.0, 0.3)
# fill into 70
for k in range(8): put(drums, tom(220 - k * 14, 0.7, 0.3), 68.75 + k * BEAT / 4 * 2 * 0.5 * 1, 1.0)
put(fx, riser(1.25, 0.5), 68.75)
# ---- 70–81.25 TACTICS (tense, half-time)
wipe(70)
TP = ["Bm", "G", "Bm", "A"]
harmony(70, 81.25, prog=TP, pad_v=0.55, bass_v=0.85, bright=1200)
t = 70.0
while t < 81.25 - 1e-6:
    kick_at(t, 1.0)
    if int(round((t - 70) / BEAT)) % 2 == 1: put(drums, clap(0.6), t, 1.0)
    put(drums, hat(0.3), t + BEAT / 2, 1.0, 0.25); put(drums, hat(0.22), t + BEAT / 4, 1.0, -0.25); put(drums, hat(0.22), t + BEAT * .75, 1.0, 0.25)
    t += BEAT
arpeggio(70, 81.25, prog=TP, v=0.28, octave=0, step=BEAT / 4)
for i in range(4): put(fx, whoosh(0.6, True, 0.3, 300, 5000), 70 + 0.9 + [0, 0.6, 1.85, 3.1][i] * 1.0 - 0.4)
put(fx, riser(BEAT * 4, 0.7), 81.25 - BEAT * 4)
# ---- 81.25–87.5 FACTS (light)
wipe(81.25)
harmony(81.25, 87.5, prog=["D", "A", "Bm", "G"], pad_v=0.45, bass_v=0.5, bright=2200)
arpeggio(81.25, 87.5, prog=["D", "A", "Bm", "G"], v=0.3, octave=12)
t = 81.25
while t < 87.5: put(drums, kick(0.6), t, 0.9); put(drums, hat(0.25), t + BEAT / 2, 1.0); t += BEAT
for tt in (83.65, 83.97, 84.29): put(drums, kick(1.0), tt, 1.0); put(fx, boom(0.35, 0.9), tt, 1.0); put(fx, clap(0.9), tt, 1.0)
put(fx, riser(BEAT * 4, 0.9), 87.5 - BEAT * 4)
# ---- 87.5–110 HISTORY (cinematic)
wipe(87.5)
HP = ["Bm", "G", "D", "A"]
put(harm, pad([38, 50, 57, 62, 66], 12, 0.7, 1400, 2.0, 1.5), 87.5)
sc = [89.5, 91.5, 93.25, 95.25, 97.25, 99.5, 101.75, 104.0, 105.75, 107.5]
# strings pad follows chords bar by bar
harmony(87.5, 99.5, prog=HP, pad_v=0.55, bass_v=0.55, bright=1600)
arpeggio(89.5, 99.5, prog=HP, v=0.24, octave=12, step=BEAT)
t = 89.5
while t < 99.5: put(drums, kick(0.7), t, 0.9) if int(round((t - 89.5) / BEAT)) % 2 == 0 else None; t += BEAT
for i, tt in enumerate(sc):
    put(fx, whoosh(0.55, True, 0.3, 300, 5000), tt - 0.4); put(drums, tom(70, 0.6, 0.6), tt, 1.0)
# 1989 hush: 99.5–103.9 only sustained strings, no drums
put(harm, pad([38, 50, 57, 62], 4.6, 0.5, 900, 1.5, 1.5), 99.4)
put(harm, choir(69, 4.4, 0.16), 99.5); put(harm, choir(66, 4.4, 0.13), 99.5)
for k in range(4): put(lead_b, lead(74 - k * 0 + [0, 2, 1, -2][k], 1.1, 0.28), 99.9 + k * 1.1, 1.0, 0)
# 2005 comeback build 101.75–104
put(fx, riser(2.25, 0.9), 101.75)
for k in range(9): put(drums, tom(100 + k * 8, 0.55 + k * 0.05, 0.4), 101.75 + k * 0.25, 1.0)
# 104 → 110 triumphant
put(fx, boom(0.9, 3.0), 104.0, 1.0)
four_floor(104.0, 110.0 - 0.0, 1.0, True, True, 0.4)
harmony(104, 110, prog=["D", "A", "Bm", "G"], pad_v=0.65, bass_v=0.9, bright=2600)
arpeggio(104, 110, prog=["D", "A", "Bm", "G"], v=0.34, octave=12)
play_motif(104, 2, prog=["D", "A", "Bm", "G"], v=0.5, oct_=0)
play_motif(107.5, 1, prog=["D", "A", "Bm", "G"], v=0.5, oct_=12, start_bar=0)
put(harm, choir(74, 5.5, 0.22), 104.2); put(harm, choir(78, 5.5, 0.2), 104.2); put(harm, choir(81, 5.5, 0.18), 104.2)
put(amb, crowd(8.0, 0.22) * np.linspace(0.2, 1.0, int(8 * SR)), 102.0)
put(fx, whoosh(0.6, True, 0.4, 300, 5000), 105.75 - 0.4); put(fx, whoosh(0.6, True, 0.4, 300, 5000), 107.5 - 0.4)
# ---- 110–120 OUTRO
# hush under "你永远不会独行"
put(harm, pad([38, 45, 50, 57, 62], 3.9, 0.55, 900, 0.3, 0.6), 110.0)
put(harm, choir(74, 3.8, 0.2), 110.0); put(harm, choir(69, 3.8, 0.18), 110.0)
for k, tt in enumerate((110.3, 111.55, 112.8)): put(fx, tick(0.5), tt)
put(fx, riser(BEAT * 2, 0.8), 113.75 - BEAT * 2 + 0.05)
# flood hit
T = 113.75
put(fx, boom(1.1, 3.5), T, 1.0)
put(fx, whoosh(0.6, False, 0.5, 600, 9000), T)
four_floor(T, 118.75, 1.0, True, True, 0.38)
harmony(T, 118.75, prog=["D", "A", "Bm", "G"], pad_v=0.65, bass_v=0.95, bright=2800)
arpeggio(T, 118.75, prog=["D", "A", "Bm", "G"], v=0.34, octave=12)
play_motif(T, 2, prog=["D", "A", "Bm", "G"], v=0.5, oct_=0)
put(harm, choir(74, 5.2, 0.22), T); put(harm, choir(78, 5.2, 0.2), T)
put(harm, pad([38, 50, 57, 62, 66, 69, 74], 4.2, 0.9, 3000, 0.05, 2.6), 118.75)  # final D chord
put(fx, boom(0.8, 3.0), 118.75, 1.0)
put(lead_b, lead(86, 2.6, 0.5), 118.75, 1.0, 0.1)
# CTA pop
put(fx, tick(1.0), 110 + 5.5); put(drums, tom(140, 0.7, 0.3), 115.5, 1.0)

# ---------- mix
def mixdown():
    d = drums
    # sidechain duck
    h = harm * (0.45 + 0.55 * duck) ; a = arp * (0.55 + 0.45 * duck); b = bassb * (0.35 + 0.65 * duck)
    mus = reverb(h + a + lead_b, 0.32, 2.6)
    hall = reverb(fx, 0.25, 2.0)
    mix = d * 0.95 + b * 0.9 + mus * 1.0 + hall * 0.9 + amb * 0.8
    mix = hp(mix, 25, 1)
    tt = np.arange(N) / SR
    dip = 1 - 0.92 * np.clip((tt - 9.84) / 0.03, 0, 1) * np.clip((10.0 - tt) / 0.005, 0, 1)
    mix = mix * dip
    # master: gentle bus compression via tanh
    mix = mix * 0.42
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    # fades
    t = np.arange(N) / SR
    fade = np.clip((DUR - t) / 1.6, 0, 1) ** 1.5
    fade *= np.clip(t / 0.05, 0, 1)
    mix *= fade
    mix = mix[:, :int(DUR * SR)]
    pk = np.abs(mix).max(); mix *= 0.80 / pk
    return mix

if __name__ == "__main__":
    m = mixdown()
    pcm = (m.T * 32767).astype("<i2")
    with wave.open(sys.argv[1] if len(sys.argv) > 1 else "score.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    for a in range(0, 120, 10):
        seg = m[:, a*SR:(a+10)*SR]; print(a, round(20*np.log10(np.sqrt((seg**2).mean())+1e-9),1), round(float(np.abs(seg).max()),2))
    print("rms dBFS", 20 * np.log10(np.sqrt((m ** 2).mean())), "peak", np.abs(m).max())
