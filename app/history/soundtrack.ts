import { sceneStarts } from "./milestones";

type Play = (o: Out, when: number, len: number) => void;
type Cue = { at: number; len: number; hold: boolean; play: Play };
type Out = { ctx: BaseAudioContext; dest: AudioNode; sources: AudioScheduledSourceNode[]; noise: AudioBuffer };

const BEAT = 0.625;
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

const D = [50, 57, 62, 66];
const G = [55, 59, 62, 67];
const A = [52, 57, 61, 64];
const Bm = [54, 59, 62, 66];
const Em = [52, 55, 59, 64];
const D_HIGH = [62, 66, 69, 74];
const D_FULL = [50, 57, 62, 66, 69, 74];

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseFor(ctx: BaseAudioContext) {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}

function run(o: Out, node: AudioScheduledSourceNode, when: number, len: number, offset = 0) {
  if (node instanceof AudioBufferSourceNode) node.start(when, offset);
  else node.start(when);
  node.stop(when + len + 0.05);
  o.sources.push(node);
}

function envelope(o: Out, when: number, len: number, peak: number, attack: number, release: number) {
  const a = Math.min(attack, len / 2);
  const r = Math.min(release, len / 2);
  const g = o.ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(peak, when + a);
  g.gain.setValueAtTime(peak, when + len - r);
  g.gain.linearRampToValueAtTime(0, when + len);
  return g;
}

function decay(o: Out, when: number, peak: number, time: number) {
  const g = o.ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(peak, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + time);
  return g;
}

function filter(o: Out, type: BiquadFilterType, frequency: number, q = 0.7) {
  const f = o.ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = q;
  return f;
}

function osc(o: Out, type: OscillatorType, frequency: number, detune = 0) {
  const node = o.ctx.createOscillator();
  node.type = type;
  node.frequency.value = frequency;
  node.detune.value = detune;
  return node;
}

function noise(o: Out, loop = false) {
  const node = o.ctx.createBufferSource();
  node.buffer = o.noise;
  node.loop = loop;
  return node;
}

const pad = (notes: number[], gain = 0.016, bright = 1100): Play => (o, when, len) => {
  const f = filter(o, "lowpass", bright, 0.6);
  f.connect(envelope(o, when, len, gain, 0.6, 0.9)).connect(o.dest);
  for (const note of notes) {
    for (const detune of [-8, 8]) {
      const voice = osc(o, "sawtooth", hz(note), detune);
      voice.connect(f);
      run(o, voice, when, len);
    }
  }
};

const bass = (note: number, gain = 0.1): Play => (o, when, len) => {
  const g = envelope(o, when, len, gain, 0.05, 0.3);
  g.connect(o.dest);
  const f = filter(o, "lowpass", 420);
  f.connect(g);
  for (const type of ["sine", "triangle"] as const) {
    const voice = osc(o, type, hz(note));
    voice.connect(f);
    run(o, voice, when, len);
  }
};

const pluck = (note: number, gain = 0.07): Play => (o, when) => {
  const g = decay(o, when, gain, 0.28);
  g.connect(o.dest);
  const f = filter(o, "lowpass", 700);
  f.connect(g);
  const voice = osc(o, "sawtooth", hz(note));
  voice.connect(f);
  run(o, voice, when, 0.3);
};

const bell = (note: number, gain = 0.05, time = 1.4): Play => (o, when) => {
  const g = decay(o, when, gain, time);
  g.connect(o.dest);
  for (const [ratio, level] of [[1, 1], [2, 0.35], [3.01, 0.12]]) {
    const partial = o.ctx.createGain();
    partial.gain.value = level;
    partial.connect(g);
    const voice = osc(o, "sine", hz(note) * ratio);
    voice.connect(partial);
    run(o, voice, when, time);
  }
};

const brass = (notes: number[], gain = 0.02): Play => (o, when, len) => {
  const f = o.ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(400, when);
  f.frequency.linearRampToValueAtTime(2800, when + 0.08);
  f.frequency.exponentialRampToValueAtTime(1100, when + len);
  f.connect(envelope(o, when, len, gain, 0.03, 0.35)).connect(o.dest);
  for (const note of notes) {
    for (const detune of [-5, 5]) {
      const voice = osc(o, "sawtooth", hz(note), detune);
      voice.connect(f);
      run(o, voice, when, len);
    }
  }
};

const kick = (gain = 0.45): Play => (o, when) => {
  const voice = osc(o, "sine", 140);
  voice.frequency.setValueAtTime(140, when);
  voice.frequency.exponentialRampToValueAtTime(42, when + 0.14);
  voice.connect(decay(o, when, gain, 0.38)).connect(o.dest);
  run(o, voice, when, 0.4);
};

const hit = (type: BiquadFilterType, frequency: number, gain: number, time: number, q = 0.7): Play => (o, when) => {
  const source = noise(o);
  source.connect(filter(o, type, frequency, q)).connect(decay(o, when, gain, time)).connect(o.dest);
  run(o, source, when, time, Math.random());
};

const clap = (gain = 0.22) => hit("bandpass", 1400, gain, 0.14, 0.9);
const hat = (gain = 0.04) => hit("highpass", 7000, gain, 0.06);
const crash = (gain = 0.14) => hit("highpass", 3500, gain, 1.8);

const boom = (gain = 0.5): Play => (o, when) => {
  const voice = osc(o, "sine", 75);
  voice.frequency.setValueAtTime(75, when);
  voice.frequency.exponentialRampToValueAtTime(38, when + 0.6);
  voice.connect(decay(o, when, gain, 1.6)).connect(o.dest);
  run(o, voice, when, 1.6);
  hit("lowpass", 220, gain * 0.6, 0.3)(o, when, 0.3);
};

const crowd = (gain = 0.06): Play => (o, when, len) => {
  const g = envelope(o, when, len, gain, 0.5, 0.9);
  g.connect(o.dest);
  for (const [frequency, q] of [[500, 0.7], [1300, 1.2], [2600, 1.5]]) {
    const source = noise(o, true);
    source.connect(filter(o, "bandpass", frequency, q)).connect(g);
    run(o, source, when, len, Math.random() * 1.5);
  }
  const lfo = osc(o, "sine", 0.6);
  const depth = o.ctx.createGain();
  depth.gain.value = gain * 0.3;
  lfo.connect(depth).connect(g.gain);
  run(o, lfo, when, len);
};

const riser = (gain = 0.05): Play => (o, when, len) => {
  const source = noise(o, true);
  const f = filter(o, "bandpass", 300, 2);
  f.frequency.setValueAtTime(300, when);
  f.frequency.exponentialRampToValueAtTime(5000, when + len);
  const g = o.ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + len - 0.05);
  g.gain.linearRampToValueAtTime(0, when + len);
  source.connect(f).connect(g).connect(o.dest);
  run(o, source, when, len);
};

function buildCues() {
  const cues: Cue[] = [];
  const at = (scene: number, s: number) => sceneStarts[scene] + s;
  const add = (scene: number, s: number, play: Play, len = 0) => cues.push({ at: at(scene, s), len, hold: false, play });
  const hold = (scene: number, s: number, len: number, play: Play) => cues.push({ at: at(scene, s), len, hold: true, play });
  const drums = (scene: number, from: number, to: number, claps = true) => {
    for (let s = from, i = 0; s < to - 0.01; s += BEAT, i++) {
      add(scene, s, kick());
      add(scene, s + BEAT / 2, hat());
      if (claps && i % 2 === 1) add(scene, s, clap());
    }
  };

  // 1892
  hold(0, 0, 4.3, pad(D, 0.014, 800));
  hold(0, 0, 4.2, bass(38, 0.08));
  [74, 78, 81, 86].forEach((note, i) => add(0, 0.4 + i * 0.5, bell(note)));
  add(0, 1.8, boom(0.35));
  add(0, 2.1, bell(93, 0.03, 2));

  // 1901
  hold(1, 0, 1.9, pad(G));
  hold(1, 1.8, 1.9, pad(D));
  hold(1, 0, 1.8, bass(43));
  hold(1, 1.8, 1.8, bass(38));
  add(1, 0.35, brass([62, 66, 69]), 0.9);
  [81, 83, 86, 88, 90, 93, 90, 86].forEach((note, i) => add(1, 1.2 + i * 0.25, bell(note, 0.025, 1)));

  // 1959
  hold(2, 0, 2.1, pad(Bm));
  hold(2, 2, 2.1, pad(G));
  for (let s = 0; s < 3.95; s += BEAT / 2) add(2, s, pluck(s < 2 ? 47 : 43));
  drums(2, 0, 4, false);
  add(2, 1.2, boom(0.4));

  // 1963
  hold(3, 0, 4.3, crowd(0.05));
  [D, A, Bm, G].forEach((chord, i) => hold(3, i, i === 3 ? 1.3 : 1.1, pad(chord)));
  [38, 45, 47, 43].forEach((note, i) => hold(3, i, 1, bass(note)));
  drums(3, 0, 4);
  [69, 74, 76, 78, 76, 74, 71, 69].forEach((note, i) => add(3, 0.8 + i * (BEAT / 2), bell(note, 0.05, 0.9)));

  // 1977–84
  hold(4, 0, 4.6, pad(D, 0.012));
  drums(4, 0, 4.5);
  [D, G, A, D_HIGH].forEach((chord, i) => add(4, 0.5 + i * 0.55, brass(chord, 0.022), 0.5));
  add(4, 0.5, crash(0.12));
  hold(4, 0, 1.05, bass(38));
  hold(4, 1.05, 0.55, bass(43));
  hold(4, 1.6, 0.55, bass(45));
  hold(4, 2.15, 2.4, bass(38));

  // 1989
  hold(5, 0, 4.7, pad(Bm, 0.012, 500));
  hold(5, 0, 4.6, bass(47, 0.05));
  [71, 66, 74, 73].forEach((note, i) => add(5, 0.5 + i, bell(note, 0.05, 2.6)));

  // 2005
  hold(6, 0, 1.5, pad(Em, 0.014, 700));
  hold(6, 1.4, 2, pad(A, 0.016, 900));
  [0.15, 0.4, 0.95, 1.2].forEach((s) => add(6, s, kick(0.4)));
  [A, Bm, D].forEach((chord, i) => {
    const s = 1.4 + i * 0.6;
    add(6, s, boom(0.35));
    add(6, s, brass(chord.slice(1)), 0.45);
    add(6, s, crowd(0.07), 0.8);
  });
  add(6, 3.3, crash(0.2));
  add(6, 3.3, boom(0.5));
  add(6, 3.3, brass(D_FULL, 0.018), 1.3);
  hold(6, 3.3, 1.5, crowd(0.08));
  hold(6, 3.3, 1.3, pad(D));
  [86, 90, 93].forEach((note, i) => add(6, 3.5 + i * 0.2, bell(note, 0.03, 1)));

  // 2019
  drums(7, 0, 3.5);
  hold(7, 0, 1.8, pad(G));
  hold(7, 1.75, 1.9, pad(D));
  hold(7, 0, 1.75, bass(43));
  hold(7, 1.75, 1.75, bass(38));
  [74, 76, 78, 81, 83].forEach((note, i) => add(7, 0.8 + i * 0.22, bell(note)));
  add(7, 2.2, bell(86, 0.07, 1.6));
  add(7, 2.2, brass(D_HIGH), 0.9);
  add(7, 2.2, crash(0.1));

  // 2020
  hold(8, 0, 2.4, pad(A, 0.02, 1300));
  hold(8, 0, 2.3, bass(45, 0.07));
  for (let s = 0; s < 2.25; s += BEAT / 2) add(8, s, pluck(45, 0.09));
  hold(8, 0.2, 2.1, riser(0.1));
  for (let s = 0.3, gap = 0.16, i = 0; s < 2.25; s += gap, gap = Math.max(0.045, gap * 0.9), i++) {
    add(8, s, clap(0.09 + i * 0.006));
  }
  add(8, 2.3, kick());
  add(8, 2.3, crash(0.2));
  add(8, 2.3, boom(0.45));
  add(8, 2.3, brass(D_FULL, 0.018), 1.2);
  hold(8, 2.3, 1.4, crowd(0.08));
  hold(8, 2.3, 1.4, pad(D));

  // 2025
  hold(9, 0, 2.1, pad(D, 0.016, 1000));
  hold(9, 0, 2, bass(38, 0.07));
  const scale = [0, 2, 4, 5, 7, 9, 11];
  for (let i = 0; i < 20; i++) add(9, 0.3 + i * 0.07, bell(62 + 12 * Math.floor(i / 7) + scale[i % 7], 0.035, 0.5));
  for (let s = 0; s < 2; s += BEAT) add(9, s, kick(0.35));
  add(9, 1.63, crash(0.15));
  add(9, 1.63, brass(D_HIGH), 0.6);
  add(9, 2.2, boom(0.3));
  hold(9, 2, 2, pad(D, 0.02, 1400));
  hold(9, 2, 2, bass(38));
  [78, 81, 86].forEach((note, i) => add(9, 2.3 + i * 0.3, bell(note, 0.05, 1.8)));
  hold(9, 2.2, 1.8, crowd(0.04));

  return cues;
}

const cues = buildCues();

export function masterBus(ctx: BaseAudioContext) {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.knee.value = 10;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.2;
  const level = ctx.createGain();
  level.gain.value = 0.8;
  compressor.connect(level).connect(ctx.destination);
  return compressor;
}

export function scheduleSoundtrack(ctx: BaseAudioContext, dest: AudioNode, from: number, when: number) {
  const out: Out = { ctx, dest, sources: [], noise: noiseFor(ctx) };
  for (const cue of cues) {
    if (cue.at >= from) cue.play(out, when + cue.at - from, cue.len);
    else if (cue.hold && cue.at + cue.len > from + 0.3) cue.play(out, when, cue.at + cue.len - from);
  }
  return out.sources;
}

export function createSoundtrack() {
  let ctx: AudioContext | null = null;
  let bus: AudioNode | null = null;
  let session: { gain: GainNode; sources: AudioScheduledSourceNode[]; at: number; from: number } | null = null;

  const stop = () => {
    if (!ctx || !session) return;
    const { gain, sources } = session;
    session = null;
    const now = ctx.currentTime;
    gain.gain.setTargetAtTime(0, now, 0.03);
    for (const source of sources) source.stop(now + 0.15);
    setTimeout(() => gain.disconnect(), 300);
  };

  return {
    play(from: number) {
      ctx ??= new AudioContext();
      bus ??= masterBus(ctx);
      void ctx.resume();
      stop();
      const gain = ctx.createGain();
      gain.connect(bus);
      const at = ctx.currentTime + 0.06;
      session = { gain, at, from, sources: scheduleSoundtrack(ctx, gain, from, at) };
    },
    stop,
    position() {
      if (!ctx || !session) return null;
      return session.from + Math.max(0, ctx.currentTime - session.at);
    },
    close() {
      stop();
      void ctx?.close();
      ctx = null;
      bus = null;
    },
  };
}
