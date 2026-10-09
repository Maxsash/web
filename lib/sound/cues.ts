import { seededRandom } from "../sea/random.ts";
import { scaleToPeak, smooth, stateVariableFilter } from "./synth.ts";

type Strike = { at: number; attack: number; decay: number; level: number };
type Repeat = { count: number; every: number; shrink: number; jitter: number };
type Partial = [ratio: number, level: number, ring: number];
type Source =
  | { noise: "low" | "band" | "high"; hz: number; quality: number }
  | { tone: number; partials: Partial[] };
export type Layer = Strike & Source & { repeat?: Repeat; glide?: number };
export type Cue = { seed: number; seconds: number; peak: number; warmth: number; layers: Layer[] };

const EDGE_SECONDS = 0.0004;

const creak = (hz: number, count: number, glide: number): Layer => ({
  at: 0,
  attack: 0.002,
  decay: 0.013,
  level: 1,
  tone: hz,
  partials: [
    [1, 1, 1],
    [2.07, 0.5, 0.7],
    [3.2, 0.25, 0.5],
  ],
  repeat: { count, every: 0.03, shrink: 0.9, jitter: 0.25 },
  glide,
});

export const CUES = {
  tick: {
    seed: 0x71c,
    seconds: 0.03,
    peak: 0.095,
    warmth: 9000,
    layers: [
      { at: 0, attack: 0.0003, decay: 0.0025, level: 1, noise: "band", hz: 2600, quality: 1.4 },
      { at: 0, attack: 0.0002, decay: 0.0015, level: 0.4, tone: 1900, partials: [[1, 1, 1]] },
    ],
  },
  click: {
    seed: 0xc11c,
    seconds: 0.12,
    peak: 0.18,
    warmth: 6000,
    layers: [
      { at: 0, attack: 0.0004, decay: 0.004, level: 1, noise: "band", hz: 1700, quality: 1 },
      {
        at: 0,
        attack: 0.001,
        decay: 0.022,
        level: 0.8,
        tone: 190,
        partials: [
          [1, 1, 1],
          [2.4, 0.3, 0.5],
        ],
      },
      { at: 0, attack: 0.001, decay: 0.015, level: 0.5, noise: "low", hz: 500, quality: 0.7 },
    ],
  },
  whoosh: {
    seed: 0x3005,
    seconds: 1,
    peak: 0.06,
    warmth: 3000,
    layers: [
      {
        at: 0,
        attack: 0.22,
        decay: 0.18,
        level: 1,
        noise: "band",
        hz: 380,
        quality: 0.9,
        glide: 3.2,
      },
      {
        at: 0,
        attack: 0.25,
        decay: 0.12,
        level: 0.25,
        noise: "band",
        hz: 1800,
        quality: 0.6,
        glide: 1.5,
      },
    ],
  },
  sail: {
    seed: 0x5a11,
    seconds: 1.3,
    peak: 0.09,
    warmth: 2500,
    layers: [
      {
        at: 0,
        attack: 0.35,
        decay: 0.3,
        level: 1,
        noise: "band",
        hz: 220,
        quality: 0.8,
        glide: 2.4,
      },
      { at: 0, attack: 0.3, decay: 0.25, level: 0.6, noise: "low", hz: 160, quality: 0.7 },
      { ...creak(180, 7, 1.25), at: 0.42, level: 0.45 },
    ],
  },
  rope: {
    seed: 0x209e,
    seconds: 0.6,
    peak: 0.11,
    warmth: 4000,
    layers: [
      creak(150, 10, 1.6),
      {
        at: 0,
        attack: 0.0004,
        decay: 0.004,
        level: 0.4,
        noise: "band",
        hz: 900,
        quality: 2,
        repeat: { count: 10, every: 0.03, shrink: 0.9, jitter: 0.25 },
      },
    ],
  },
  bell: {
    seed: 0xbe11,
    seconds: 2.4,
    peak: 0.07,
    warmth: 5000,
    layers: [
      {
        at: 0,
        attack: 0.0015,
        decay: 0.7,
        level: 1,
        tone: 680,
        partials: [
          [1, 1, 1],
          [2, 0.55, 0.6],
          [2.76, 0.4, 0.45],
          [5.4, 0.18, 0.25],
          [8.93, 0.08, 0.15],
        ],
        repeat: { count: 2, every: 0.36, shrink: 0.85, jitter: 0 },
      },
      {
        at: 0,
        attack: 0.0003,
        decay: 0.003,
        level: 0.35,
        noise: "band",
        hz: 3200,
        quality: 1,
        repeat: { count: 2, every: 0.36, shrink: 0.85, jitter: 0 },
      },
    ],
  },
  stamp: {
    seed: 0x57a3,
    seconds: 0.3,
    peak: 0.22,
    warmth: 4500,
    layers: [
      {
        at: 0,
        attack: 0.002,
        decay: 0.035,
        level: 1,
        tone: 170,
        partials: [
          [1, 1, 1],
          [2.3, 0.25, 0.5],
        ],
      },
      { at: 0, attack: 0.001, decay: 0.03, level: 0.8, noise: "low", hz: 420, quality: 0.7 },
      { at: 0, attack: 0.0005, decay: 0.008, level: 0.6, noise: "band", hz: 1400, quality: 0.8 },
    ],
  },
  thud: {
    seed: 0x7d0d,
    seconds: 0.4,
    peak: 0.2,
    warmth: 1800,
    layers: [
      {
        at: 0,
        attack: 0.002,
        decay: 0.05,
        level: 1,
        tone: 140,
        partials: [
          [1, 1, 1],
          [1.9, 0.3, 0.6],
        ],
        repeat: { count: 2, every: 0.13, shrink: 0.75, jitter: 0 },
      },
      {
        at: 0,
        attack: 0.001,
        decay: 0.03,
        level: 0.7,
        noise: "low",
        hz: 320,
        quality: 0.8,
        repeat: { count: 2, every: 0.13, shrink: 0.75, jitter: 0 },
      },
    ],
  },
  swell: {
    seed: 0x5e11,
    seconds: 2.4,
    peak: 0.05,
    warmth: 1500,
    layers: [
      {
        at: 0,
        attack: 0.6,
        decay: 0.45,
        level: 1,
        noise: "band",
        hz: 260,
        quality: 0.7,
        glide: 1.9,
      },
      { at: 0, attack: 0.6, decay: 0.5, level: 0.5, noise: "low", hz: 180, quality: 0.7 },
    ],
  },
  scratch: {
    seed: 0x5c2a,
    seconds: 0.25,
    peak: 0.07,
    warmth: 9000,
    layers: [
      {
        at: 0,
        attack: 0.002,
        decay: 0.006,
        level: 1,
        noise: "high",
        hz: 3000,
        quality: 0.9,
        repeat: { count: 8, every: 0.018, shrink: 0.93, jitter: 0.45 },
      },
      {
        at: 0,
        attack: 0.003,
        decay: 0.03,
        level: 0.3,
        noise: "band",
        hz: 5200,
        quality: 1.5,
        glide: 1.2,
      },
    ],
  },
  nib: {
    seed: 0x41b,
    seconds: 0.03,
    peak: 0.067,
    warmth: 9000,
    layers: [
      { at: 0, attack: 0.001, decay: 0.004, level: 1, noise: "high", hz: 2800, quality: 0.9 },
      { at: 0, attack: 0.001, decay: 0.006, level: 0.3, noise: "band", hz: 4500, quality: 1.4 },
    ],
  },
  pen: {
    seed: 0x9e4,
    seconds: 1.1,
    peak: 0.056,
    warmth: 9000,
    layers: [
      {
        at: 0,
        attack: 0.004,
        decay: 0.03,
        level: 1,
        noise: "high",
        hz: 2600,
        quality: 0.9,
        glide: 1.3,
        repeat: { count: 6, every: 0.14, shrink: 0.95, jitter: 0.2 },
      },
      {
        at: 0,
        attack: 0.01,
        decay: 0.05,
        level: 0.25,
        noise: "band",
        hz: 4800,
        quality: 1.2,
        repeat: { count: 6, every: 0.14, shrink: 0.95, jitter: 0.2 },
      },
    ],
  },
  dice: {
    seed: 0xd1ce,
    seconds: 0.6,
    peak: 0.16,
    warmth: 7000,
    layers: [
      {
        at: 0,
        attack: 0.0003,
        decay: 0.005,
        level: 1,
        noise: "band",
        hz: 2100,
        quality: 2.2,
        repeat: { count: 7, every: 0.055, shrink: 0.8, jitter: 0.55 },
      },
      {
        at: 0,
        attack: 0.0002,
        decay: 0.006,
        level: 0.6,
        tone: 1150,
        partials: [
          [1, 1, 1],
          [2.6, 0.5, 0.6],
        ],
        repeat: { count: 7, every: 0.055, shrink: 0.8, jitter: 0.55 },
      },
    ],
  },
  pin: {
    seed: 0x919,
    seconds: 0.3,
    peak: 0.107,
    warmth: 9000,
    layers: [
      {
        at: 0,
        attack: 0.0003,
        decay: 0.045,
        level: 0.7,
        tone: 2300,
        partials: [
          [1, 1, 1],
          [2.7, 0.35, 0.5],
          [5.1, 0.12, 0.3],
        ],
      },
      { at: 0, attack: 0.0002, decay: 0.002, level: 0.5, noise: "band", hz: 3500, quality: 1 },
      { at: 0.004, attack: 0.001, decay: 0.012, level: 0.5, tone: 210, partials: [[1, 1, 1]] },
    ],
  },
  key: {
    seed: 0x6e7,
    seconds: 0.08,
    peak: 0.175,
    warmth: 7000,
    layers: [
      { at: 0, attack: 0.0003, decay: 0.003, level: 1, noise: "band", hz: 2400, quality: 1.3 },
      {
        at: 0,
        attack: 0.0008,
        decay: 0.012,
        level: 0.6,
        tone: 260,
        partials: [
          [1, 1, 1],
          [2.2, 0.4, 0.5],
        ],
      },
      { at: 0.028, attack: 0.0003, decay: 0.003, level: 0.45, noise: "band", hz: 1600, quality: 1 },
    ],
  },
  latch: {
    seed: 0x1a7c,
    seconds: 0.2,
    peak: 0.16,
    warmth: 5000,
    layers: [
      {
        at: 0,
        attack: 0.0004,
        decay: 0.005,
        level: 1,
        noise: "band",
        hz: 1300,
        quality: 1.6,
        repeat: { count: 2, every: 0.045, shrink: 0.7, jitter: 0 },
      },
      {
        at: 0,
        attack: 0.0006,
        decay: 0.014,
        level: 0.7,
        tone: 420,
        partials: [
          [1, 1, 1],
          [2.3, 0.4, 0.6],
        ],
        repeat: { count: 2, every: 0.045, shrink: 0.7, jitter: 0 },
      },
    ],
  },
  step: {
    seed: 0x57e9,
    seconds: 0.16,
    peak: 0.075,
    warmth: 5000,
    layers: [
      { at: 0, attack: 0.012, decay: 0.035, level: 1, noise: "low", hz: 700, quality: 0.7 },
      {
        at: 0.004,
        attack: 0.0005,
        decay: 0.0018,
        level: 0.5,
        noise: "band",
        hz: 3200,
        quality: 1,
        repeat: { count: 6, every: 0.009, shrink: 0.8, jitter: 0.6 },
      },
    ],
  },
  foghorn: {
    seed: 0xf09,
    seconds: 2.8,
    peak: 0.1,
    warmth: 700,
    layers: [
      {
        at: 0,
        attack: 0.35,
        decay: 0.7,
        level: 1,
        tone: 92,
        glide: 0.97,
        partials: [
          [1, 1, 1],
          [2, 0.7, 1],
          [3, 0.45, 1],
          [4, 0.3, 1],
          [5, 0.15, 1],
          [6, 0.08, 1],
        ],
      },
    ],
  },
  quill: {
    seed: 0x9111,
    seconds: 0.45,
    peak: 0.06,
    warmth: 9000,
    layers: [
      {
        at: 0,
        attack: 0.03,
        decay: 0.07,
        level: 1,
        noise: "band",
        hz: 2600,
        quality: 1.6,
        glide: 1.8,
      },
      {
        at: 0.17,
        attack: 0.02,
        decay: 0.06,
        level: 0.8,
        noise: "band",
        hz: 3400,
        quality: 1.6,
        glide: 0.6,
      },
      { at: 0.26, attack: 0.001, decay: 0.004, level: 0.3, noise: "high", hz: 4000, quality: 0.9 },
    ],
  },
  calm: {
    seed: 0xca1,
    seconds: 1.3,
    peak: 0.07,
    warmth: 2500,
    layers: [
      {
        at: 0,
        attack: 0.05,
        decay: 0.35,
        level: 1,
        noise: "band",
        hz: 900,
        quality: 0.8,
        glide: 0.3,
      },
      {
        at: 0,
        attack: 0.05,
        decay: 0.3,
        level: 0.5,
        noise: "low",
        hz: 400,
        quality: 0.7,
        glide: 0.5,
      },
    ],
  },
  stir: {
    seed: 0x5717,
    seconds: 1.1,
    peak: 0.05,
    warmth: 2500,
    layers: [
      { at: 0, attack: 0.45, decay: 0.2, level: 1, noise: "band", hz: 300, quality: 0.8, glide: 3 },
    ],
  },
  slide: {
    seed: 0x511d,
    seconds: 0.35,
    peak: 0.062,
    warmth: 5000,
    layers: [
      {
        at: 0,
        attack: 0.05,
        decay: 0.07,
        level: 1,
        noise: "band",
        hz: 900,
        quality: 0.7,
        glide: 1.6,
      },
      { at: 0, attack: 0.05, decay: 0.05, level: 0.2, noise: "high", hz: 3500, quality: 0.9 },
    ],
  },
  drop: {
    seed: 0xd209,
    seconds: 0.2,
    peak: 0.107,
    warmth: 6000,
    layers: [
      { at: 0, attack: 0.001, decay: 0.03, level: 1, tone: 380, glide: 2.4, partials: [[1, 1, 1]] },
      { at: 0, attack: 0.0005, decay: 0.006, level: 0.4, noise: "band", hz: 1200, quality: 1.2 },
    ],
  },
} satisfies Record<string, Cue>;

export type CueName = keyof typeof CUES;

const shape = (t: number, attack: number, decay: number) =>
  t < 0 ? 0 : (attack > 0 ? smooth(t / attack) : 1) * Math.exp(-Math.max(0, t - attack) / decay);

function strikes({ at, level, repeat }: Layer, seed: number) {
  const random = seededRandom(seed);
  const hits = [{ at, level }];
  for (let k = 1; k < (repeat?.count ?? 1); k++) {
    const { every, shrink, jitter } = repeat!;
    const previous = hits[k - 1];
    hits.push({
      at: previous.at + every * (1 + jitter * (random() * 2 - 1)),
      level: previous.level * shrink,
    });
  }
  return hits;
}

function renderLayer(
  layer: Layer,
  length: number,
  sampleRate: number,
  seed: number,
  index: number,
) {
  const hits = strikes(layer, seed);
  const random = seededRandom((seed + index) ^ 0x9e3779b9);
  const span = layer.attack + layer.decay;
  const pitch = (t: number) => (layer.glide ?? 1) ** smooth((t - layer.at) / span);
  const struck = (t: number, decay: number) =>
    hits.reduce((sum, hit) => sum + hit.level * shape(t - hit.at, layer.attack, decay), 0);
  const samples = new Float32Array(length);
  if ("noise" in layer) {
    const filter = stateVariableFilter();
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const filtered = filter(random() * 2 - 1, layer.hz * pitch(t), sampleRate, layer.quality);
      samples[i] = filtered[layer.noise] * struck(t, layer.decay);
    }
  } else {
    const phases = layer.partials.map(() => random() * 2 * Math.PI);
    let phase = 0;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      phase += (2 * Math.PI * layer.tone * pitch(t)) / sampleRate;
      samples[i] = layer.partials.reduce(
        (sum, [ratio, level, ring], k) =>
          sum + level * Math.sin(phase * ratio + phases[k]) * struck(t, layer.decay * ring),
        0,
      );
    }
  }
  const loudest = samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
  return samples.map((sample) => (loudest ? (sample / loudest) * layer.level : 0));
}

export function synthesizeCue(sampleRate: number, cue: Cue): Float32Array<ArrayBuffer> {
  const length = Math.round(cue.seconds * sampleRate);
  const mixed = new Float32Array(length);
  cue.layers.forEach((layer, index) =>
    renderLayer(layer, length, sampleRate, cue.seed, index).forEach(
      (sample, i) => (mixed[i] += sample),
    ),
  );
  const rate = 1 - Math.exp((-2 * Math.PI * cue.warmth) / sampleRate);
  let tone = 0;
  for (let i = 0; i < length; i++) mixed[i] = tone += rate * (mixed[i] - tone);
  return scaleToPeak(mixed, cue.peak, EDGE_SECONDS, sampleRate);
}
