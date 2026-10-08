import { seededRandom } from "./sea/random.ts";

type Swish = {
  start: number;
  attack: number;
  release: number;
  lowHz: number;
  highHz: number;
  quality: number;
};
type Landing = { at: number; thudHz: number; thudDecay: number; thudLevel: number };
export type PageTurn = {
  seed: number;
  duration: number;
  peak: number;
  swish: Swish;
  landing: Landing;
  brightness: number;
};

const HUSH: PageTurn = {
  seed: 0x70a6e,
  duration: 0.9,
  peak: 0.14,
  swish: { start: 0.05, attack: 0.3, release: 0.32, lowHz: 220, highHz: 800, quality: 0.9 },
  landing: { at: 0.5, thudHz: 150, thudDecay: 0.05, thudLevel: 1 },
  brightness: 1300,
};

export const PAGE_TURNS: PageTurn[] = [
  HUSH,
  {
    ...HUSH,
    seed: 0x1b3c5,
    duration: 0.8,
    swish: { ...HUSH.swish, attack: 0.26, release: 0.28, lowHz: 240, highHz: 900, quality: 1 },
    landing: { at: 0.45, thudHz: 160, thudDecay: 0.045, thudLevel: 1 },
    brightness: 1400,
  },
  {
    ...HUSH,
    seed: 0x5d2a9,
    duration: 0.95,
    swish: { ...HUSH.swish, attack: 0.32, release: 0.34, lowHz: 190, highHz: 700, quality: 0.85 },
    landing: { at: 0.54, thudHz: 130, thudDecay: 0.06, thudLevel: 1.1 },
    brightness: 1200,
  },
  {
    ...HUSH,
    seed: 0x92e77,
    duration: 0.85,
    swish: {
      ...HUSH.swish,
      start: 0.06,
      attack: 0.28,
      release: 0.3,
      lowHz: 260,
      highHz: 950,
      quality: 1,
    },
    landing: { at: 0.47, thudHz: 170, thudDecay: 0.04, thudLevel: 0.8 },
    brightness: 1500,
  },
];

export function choosePageTurn(random: () => number, previous = -1) {
  const others = PAGE_TURNS.map((_, index) => index).filter((index) => index !== previous);
  return {
    variant: others[Math.floor(random() * others.length)],
    rate: 0.96 + random() * 0.08,
    gain: 0.85 + random() * 0.3,
  };
}

function filter() {
  let low = 0;
  let band = 0;
  return (input: number, hz: number, sampleRate: number, quality: number) => {
    const frequency = 2 * Math.sin((Math.PI * hz) / sampleRate);
    low += frequency * band;
    const high = input - low - band / quality;
    band += frequency * high;
    return { low, band };
  };
}

const smooth = (t: number) => Math.sin((Math.PI / 2) * Math.min(1, Math.max(0, t))) ** 2;

export function synthesizePageTurn(
  sampleRate: number,
  variant: PageTurn = PAGE_TURNS[0],
): Float32Array<ArrayBuffer> {
  const { swish, landing } = variant;
  const random = seededRandom(variant.seed);
  const noise = () => random() * 2 - 1;
  const samples = new Float32Array(Math.round(variant.duration * sampleRate));
  const swishFilter = filter();
  const thudFilter = filter();
  const toneRate = 1 - Math.exp((-2 * Math.PI * variant.brightness) / sampleRate);
  let tone = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    let value = 0;

    const into = (t - swish.start) / swish.attack;
    const out = (swish.start + swish.attack + swish.release - t) / swish.release;
    const envelope = Math.min(smooth(into), smooth(out));
    if (envelope > 0) {
      const hz = swish.lowHz + (swish.highHz - swish.lowHz) * smooth(into) ** 1.2 * smooth(out);
      value += swishFilter(noise(), hz, sampleRate, swish.quality).band * envelope;
    }

    const after = t - landing.at;
    if (after > 0)
      value +=
        thudFilter(noise(), landing.thudHz, sampleRate, 0.8).low *
        Math.exp(-after / landing.thudDecay) *
        landing.thudLevel;

    tone += toneRate * (value - tone);
    samples[i] = tone;
  }
  const peak = samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
  const scale = peak ? variant.peak / peak : 0;
  const fade = Math.round(0.02 * sampleRate);
  for (let i = 0; i < samples.length; i++) {
    const edge = Math.min(1, i / fade, (samples.length - 1 - i) / fade);
    samples[i] *= scale * edge;
  }
  return samples;
}
